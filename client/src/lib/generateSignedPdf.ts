import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabaseAdmin } from './supabaseAdmin';

export async function generateSignedPdf(documentId: number): Promise<Uint8Array> {
  // 1. Fetch document metadata
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (!doc) throw new Error('Document not found');

  // 2. Fetch recipients
  const { data: recipients } = await supabaseAdmin
    .from('recipients')
    .select('*')
    .eq('document_id', documentId);

  // 3. Fetch fields (with values)
  const { data: fields } = await supabaseAdmin
    .from('document_fields')
    .select('*')
    .eq('document_id', documentId);

  // 4. Download original PDF from storage
  let pdfBytes: ArrayBuffer;
  if (doc.file_path) {
    const { data: fileData } = await supabaseAdmin.storage
      .from('documents')
      .download(doc.file_path);
    if (!fileData) throw new Error('Could not download PDF from storage');
    pdfBytes = await fileData.arrayBuffer();
  } else {
    // No stored PDF — create a blank placeholder
    const blankDoc = await PDFDocument.create();
    const blankPage = blankDoc.addPage([612, 792]);
    const blankFont = await blankDoc.embedFont(StandardFonts.Helvetica);
    blankPage.drawText(doc.title || 'Document', {
      x: 50,
      y: 720,
      size: 18,
      font: blankFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    blankPage.drawText('This document was not uploaded as a PDF file.', {
      x: 50,
      y: 680,
      size: 11,
      font: blankFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    pdfBytes = (await blankDoc.save()).buffer as ArrayBuffer;
  }

  // 5. Load and modify PDF
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  // 6. Embed field values
  for (const field of (fields || [])) {
    if (!field.value) continue;
    const pageIndex = (field.page || 1) - 1;
    const page = pages[pageIndex];
    if (!page) continue;

    const { width: pageWidth, height: pageHeight } = page.getSize();

    // field.x and field.y are in pixel coordinates from the viewer
    // The viewer renders at a fixed width of 816px for a 612-point page
    const x = (field.x / 816) * pageWidth;
    const y = pageHeight - ((field.y / 1056) * pageHeight) - (field.height || 36);

    if (field.value.startsWith('data:image')) {
      // Embed signature image
      try {
        const base64 = field.value.split(',')[1];
        const imageBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const isPng = field.value.includes('data:image/png');
        const image = isPng
          ? await pdfDoc.embedPng(imageBytes)
          : await pdfDoc.embedJpg(imageBytes);
        const fieldW = field.width || 180;
        const fieldH = field.height || 50;
        const scale = Math.min(fieldW / image.width, fieldH / image.height);
        const imgDims = image.scale(scale);
        page.drawImage(image, {
          x,
          y: y + (fieldH - imgDims.height) / 2,
          width: imgDims.width,
          height: imgDims.height,
        });
      } catch {
        page.drawText('[Signature]', {
          x,
          y: y + 8,
          size: 12,
          font: helveticaBold,
          color: rgb(0.1, 0.1, 0.8),
        });
      }
    } else {
      const displayValue = field.value.startsWith('typed:')
        ? field.value.replace('typed:', '')
        : field.value;

      page.drawText(displayValue, {
        x,
        y: y + 8,
        size: field.type === 'signature' || field.type === 'initials' ? 14 : 10,
        font: field.type === 'signature' || field.type === 'initials' ? helveticaBold : helvetica,
        color: rgb(0.1, 0.1, 0.8),
      });
    }
  }

  // 7. Append signing certificate page
  const certPage = pdfDoc.addPage([612, 792]);
  const { width, height } = certPage.getSize();

  // Header bar
  certPage.drawRectangle({
    x: 0,
    y: height - 80,
    width,
    height: 80,
    color: rgb(0.05, 0.07, 0.09),
  });
  certPage.drawText('SIGNING CERTIFICATE', {
    x: 40,
    y: height - 35,
    size: 16,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  certPage.drawText('DraftSendSign \u2014 Legally Binding Electronic Signature Record', {
    x: 40,
    y: height - 55,
    size: 9,
    font: helvetica,
    color: rgb(0.7, 0.7, 0.7),
  });

  // Document info
  let y = height - 110;
  const line = (label: string, value: string) => {
    certPage.drawText(label, {
      x: 40,
      y,
      size: 9,
      font: helveticaBold,
      color: rgb(0.4, 0.4, 0.4),
    });
    certPage.drawText(value, {
      x: 160,
      y,
      size: 9,
      font: helvetica,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 18;
  };

  line('Document:', doc.title || 'Untitled');
  line('Document ID:', `DSS-${doc.id}`);
  line('Created:', doc.created_at ? new Date(doc.created_at).toLocaleString() : '\u2014');
  line('Completed:', doc.completed_at ? new Date(doc.completed_at).toLocaleString() : '\u2014');
  line('Status:', (doc.status || '').toUpperCase());

  y -= 10;
  certPage.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 24;

  certPage.drawText('SIGNATORIES', {
    x: 40,
    y,
    size: 11,
    font: helveticaBold,
    color: rgb(0.05, 0.07, 0.09),
  });
  y -= 20;

  for (const r of (recipients || [])) {
    if (y < 80) break;

    certPage.drawText(r.name || 'Unknown', {
      x: 40,
      y,
      size: 10,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 15;

    certPage.drawText(r.email || '', {
      x: 40,
      y,
      size: 9,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 14;

    const statusColor =
      r.status === 'signed' ? rgb(0.1, 0.6, 0.2) : rgb(0.7, 0.4, 0);
    certPage.drawText(`Status: ${(r.status || 'PENDING').toUpperCase()}`, {
      x: 40,
      y,
      size: 9,
      font: helvetica,
      color: statusColor,
    });

    if (r.signed_at) {
      certPage.drawText(`Signed: ${new Date(r.signed_at).toLocaleString()}`, {
        x: 200,
        y,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    if (r.ip_address) {
      certPage.drawText(`IP: ${r.ip_address}`, {
        x: 380,
        y,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    y -= 24;
  }

  // Footer
  certPage.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 50,
    color: rgb(0.97, 0.97, 0.97),
  });
  certPage.drawText(
    'This certificate serves as legal evidence of electronic signature under the ESIGN Act and eIDAS Regulation.',
    {
      x: 40,
      y: 30,
      size: 7.5,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    }
  );
  certPage.drawText(
    `Generated by DraftSendSign \u2022 app.draftsendsign.com \u2022 ${new Date().toISOString()}`,
    {
      x: 40,
      y: 14,
      size: 7,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    }
  );

  return pdfDoc.save();
}
