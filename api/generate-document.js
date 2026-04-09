// Uses OpenAI API to generate a legal document
// This key needs to be replaced with a real key — use placeholder for now
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-placeholder';
const APP_URL = 'https://app.draftsendsign.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { documentType, parties, purpose, terms, jurisdiction, effectiveDate, additionalDetails } = req.body;

  if (!parties || !purpose) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (OPENAI_API_KEY === 'sk-placeholder') {
    // Return a realistic mock document for testing
    const mockDoc = generateMockDocument({ documentType, parties, purpose, terms, jurisdiction, effectiveDate, additionalDetails });
    return res.status(200).json({ document: mockDoc, documentType: documentType || 'Agreement' });
  }

  const systemPrompt = `You are a professional legal document drafter. Generate complete, professional legal agreements based on the user's inputs. 
  
  Rules:
  - Write in formal legal language
  - Include all standard clauses for the document type
  - Use [SIGNATURE] as a placeholder where each party needs to sign
  - Use [DATE_SIGNED] as a placeholder for signature dates
  - Include proper headings, numbered sections
  - Make it complete and ready to sign
  - Output ONLY the document text, no preamble or explanation`;

  const userPrompt = buildPrompt({ documentType, parties, purpose, terms, jurisdiction, effectiveDate, additionalDetails });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'OpenAI error' });
    }

    const data = await response.json();
    const documentText = data.choices[0]?.message?.content || '';
    const detectedType = detectDocumentType(documentType, purpose);

    return res.status(200).json({ document: documentText, documentType: detectedType });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function buildPrompt({ documentType, parties, purpose, terms, jurisdiction, effectiveDate, additionalDetails }) {
  return `Generate a complete ${documentType || 'legal agreement'} with the following details:

PARTIES INVOLVED:
${parties}

PURPOSE / DESCRIPTION:
${purpose}

${terms ? `KEY TERMS AND CONDITIONS:\n${terms}\n` : ''}
${jurisdiction ? `GOVERNING LAW: ${jurisdiction}\n` : ''}
${effectiveDate ? `EFFECTIVE DATE: ${effectiveDate}\n` : ''}
${additionalDetails ? `ADDITIONAL DETAILS:\n${additionalDetails}\n` : ''}

Generate a complete, professional legal document ready for signing. Include signature blocks at the end for each party with [SIGNATURE] and [DATE_SIGNED] placeholders.`;
}

function detectDocumentType(requested, purpose) {
  if (requested) return requested;
  const p = (purpose || '').toLowerCase();
  if (p.includes('nda') || p.includes('confidential')) return 'Non-Disclosure Agreement';
  if (p.includes('employ') || p.includes('hire') || p.includes('job')) return 'Employment Agreement';
  if (p.includes('service') || p.includes('consult') || p.includes('freelance')) return 'Service Agreement';
  if (p.includes('vendor') || p.includes('supplier')) return 'Vendor Agreement';
  if (p.includes('partner') || p.includes('joint venture')) return 'Partnership Agreement';
  if (p.includes('waiver') || p.includes('release') || p.includes('liability')) return 'Liability Waiver';
  if (p.includes('lease') || p.includes('rent')) return 'Lease Agreement';
  return 'Agreement';
}

function generateMockDocument({ documentType, parties, purpose, jurisdiction, effectiveDate }) {
  const type = detectDocumentType(documentType, purpose);
  const date = effectiveDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const jur = jurisdiction || 'the State of Delaware';
  
  return `${type.toUpperCase()}

This ${type} ("Agreement") is entered into as of ${date} by and between the following parties:

${parties || 'Party A and Party B'}

WHEREAS, the parties desire to enter into this Agreement to set forth their respective rights and obligations;

NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

1. PURPOSE
${purpose || 'The purpose of this Agreement is as set forth herein.'}

2. TERM
This Agreement shall commence on the Effective Date and shall continue until terminated in accordance with the provisions hereof.

3. OBLIGATIONS OF THE PARTIES
Each party shall perform their obligations as described herein in a professional and timely manner, in accordance with applicable laws and regulations.

4. CONFIDENTIALITY
Each party agrees to maintain the confidentiality of any proprietary or confidential information disclosed by the other party in connection with this Agreement.

5. REPRESENTATIONS AND WARRANTIES
Each party represents and warrants that: (a) it has full power and authority to enter into this Agreement; (b) this Agreement constitutes a legal, valid, and binding obligation; and (c) the execution of this Agreement does not violate any applicable law or agreement.

6. LIMITATION OF LIABILITY
IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES.

7. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of ${jur}, without regard to its conflict of law provisions.

8. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements and understandings.

9. AMENDMENTS
This Agreement may not be amended except by a written instrument signed by both parties.

10. COUNTERPARTS
This Agreement may be executed in counterparts, each of which shall be deemed an original.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

[SIGNATURE]
[DATE_SIGNED]

[SIGNATURE]
[DATE_SIGNED]`;
}
