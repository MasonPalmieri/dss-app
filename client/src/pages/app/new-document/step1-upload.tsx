import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X, Zap } from "lucide-react";
import type { WizardFile } from "./index";

const DEMO_DOCS = [
  { name: "Non-Disclosure Agreement.pdf", size: "218 KB", pages: 2 },
  { name: "Employment Contract.pdf", size: "342 KB", pages: 4 },
  { name: "Consulting Agreement.pdf", size: "189 KB", pages: 3 },
  { name: "Vendor Services Agreement.pdf", size: "276 KB", pages: 3 },
];

interface Props {
  file: WizardFile | null;
  setFile: (f: WizardFile | null) => void;
  onNext: () => void;
}

export default function Step1Upload({ file, setFile, onNext }: Props) {
  const processFile = useCallback(async (f: File) => {
    // Get real page count from PDF
    let pages = Math.max(1, Math.ceil(f.size / 50000));
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      pages = pdf.numPages;
    } catch {}
    setFile({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB`, pages, fileObject: f });
  }, [setFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          {!file ? (
            <div className="space-y-6">
              <div
                className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-[#c8210d]/50 hover:bg-[#c8210d]/5 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
                data-testid="upload-dropzone"
              >
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-1">Upload your document</h3>
                <p className="text-sm text-muted-foreground mb-4">Drag & drop a PDF, or click to browse</p>
                <Button variant="outline" size="sm">Browse Files</Button>
                <input id="file-input" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileInput} />
              </div>

              {/* Demo shortcut */}
              <div>
                <p className="text-xs text-muted-foreground text-center mb-3 flex items-center gap-2 justify-center">
                  <Zap className="h-3 w-3 text-[#c8210d]" />
                  Or use a demo document to try the workflow
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_DOCS.map(doc => (
                    <button
                      key={doc.name}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:border-[#c8210d]/40 hover:bg-[#c8210d]/5 transition-colors text-left group"
                      onClick={() => setFile(doc)}
                      data-testid={`demo-doc-${doc.name}`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-[#c8210d]/10 text-[#c8210d] shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate group-hover:text-[#c8210d] transition-colors">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.size} · {doc.pages} pages</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#c8210d]/10 text-[#c8210d]">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{file.size} · {file.pages} page{file.pages > 1 ? "s" : ""}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)} data-testid="remove-file">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
          disabled={!file}
          onClick={onNext}
          data-testid="step1-next"
        >
          Next: Add Recipients
        </Button>
      </div>
    </div>
  );
}
