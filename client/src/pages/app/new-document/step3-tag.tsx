import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PenTool, Type, Calendar, User, Hash, CheckSquare,
  Building2, Briefcase, ArrowLeft, X, GripVertical,
} from "lucide-react";
import type { WizardFile, WizardRecipient, PlacedField } from "./index";

const FIELD_TYPES = [
  { type: "signature", label: "Signature", icon: PenTool, color: "#c8210d" },
  { type: "initials", label: "Initials", icon: Type, color: "#7c3aed" },
  { type: "date", label: "Date Signed", icon: Calendar, color: "#0891b2" },
  { type: "name", label: "Full Name", icon: User, color: "#059669" },
  { type: "text", label: "Text", icon: Hash, color: "#d97706" },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, color: "#db2777" },
  { type: "company", label: "Company", icon: Building2, color: "#4f46e5" },
  { type: "title", label: "Title / Role", icon: Briefcase, color: "#0d9488" },
];

// Sizes as percentage of page width/height
const FIELD_SIZES: Record<string, { w: number; h: number }> = {
  signature: { w: 24, h: 6 },
  initials:  { w: 10, h: 5 },
  date:      { w: 16, h: 4 },
  name:      { w: 22, h: 4 },
  text:      { w: 22, h: 4 },
  checkbox:  { w: 3.5, h: 3.5 },
  company:   { w: 22, h: 4 },
  title:     { w: 20, h: 4 },
};

// Demo page content (3 pages of a realistic NDA)
const DEMO_PAGES = [
  [
    { text: "NON-DISCLOSURE AGREEMENT", bold: true, center: true, size: 16 },
    { text: "", size: 8 },
    { text: "This Non-Disclosure Agreement (\"Agreement\") is entered into as of the date last signed below,", size: 11 },
    { text: "by and between the parties identified below (collectively, the \"Parties\").", size: 11 },
    { text: "", size: 10 },
    { text: "1.  DEFINITION OF CONFIDENTIAL INFORMATION", bold: true, size: 12 },
    { text: "\"Confidential Information\" means any data or information that is proprietary to the", size: 11 },
    { text: "Disclosing Party and not generally known to the public, whether in tangible or intangible form,", size: 11 },
    { text: "whenever and however disclosed, including, but not limited to: technical data, trade secrets,", size: 11 },
    { text: "know-how, research, product plans, products, services, customers, markets, or finances.", size: 11 },
    { text: "", size: 10 },
    { text: "2.  OBLIGATIONS OF RECEIVING PARTY", bold: true, size: 12 },
    { text: "The Receiving Party agrees to: (a) hold the Confidential Information in strict confidence;", size: 11 },
    { text: "(b) not to disclose the Confidential Information to any third parties; and (c) use the", size: 11 },
    { text: "Confidential Information solely for the purpose of evaluating a potential business relationship.", size: 11 },
    { text: "", size: 10 },
    { text: "3.  TERM", bold: true, size: 12 },
    { text: "This Agreement shall remain in effect for a period of two (2) years from the date of execution,", size: 11 },
    { text: "unless earlier terminated by either Party upon thirty (30) days written notice.", size: 11 },
    { text: "", size: 10 },
    { text: "4.  RETURN OF INFORMATION", bold: true, size: 12 },
    { text: "Upon request, the Receiving Party shall promptly return or destroy all Confidential Information.", size: 11 },
    { text: "", size: 10 },
    { text: "5.  REMEDIES", bold: true, size: 12 },
    { text: "The Parties acknowledge that any breach of this Agreement may cause irreparable harm.", size: 11 },
  ],
  [
    { text: "6.  GOVERNING LAW", bold: true, size: 12 },
    { text: "This Agreement shall be governed by and construed in accordance with the laws of the", size: 11 },
    { text: "State of Delaware, without regard to its conflict of law provisions.", size: 11 },
    { text: "", size: 10 },
    { text: "7.  ENTIRE AGREEMENT", bold: true, size: 12 },
    { text: "This Agreement constitutes the entire agreement between the Parties with respect to the", size: 11 },
    { text: "subject matter hereof and supersedes all prior negotiations, representations, warranties,", size: 11 },
    { text: "and understandings of the Parties with respect thereto.", size: 11 },
    { text: "", size: 10 },
    { text: "8.  AMENDMENTS", bold: true, size: 12 },
    { text: "No amendment, modification, or supplement of any provision of this Agreement will be valid", size: 11 },
    { text: "or effective unless made in writing and signed by a duly authorized representative.", size: 11 },
    { text: "", size: 10 },
    { text: "9.  WAIVER", bold: true, size: 12 },
    { text: "No waiver by either Party of any breach or default hereunder shall be deemed a waiver", size: 11 },
    { text: "of any preceding or subsequent breach or default.", size: 11 },
    { text: "", size: 10 },
    { text: "10. SEVERABILITY", bold: true, size: 12 },
    { text: "If any provision of this Agreement is held to be invalid or unenforceable, the remaining", size: 11 },
    { text: "provisions of this Agreement will remain in full force and effect.", size: 11 },
    { text: "", size: 10 },
    { text: "11. COUNTERPARTS", bold: true, size: 12 },
    { text: "Electronic signatures shall be deemed valid and binding to the same extent as originals.", size: 11 },
  ],
  [
    { text: "EXHIBIT A — DESCRIPTION OF CONFIDENTIAL INFORMATION", bold: true, center: true, size: 13 },
    { text: "", size: 10 },
    { text: "The Confidential Information subject to this Agreement includes, but is not limited to:", size: 11 },
    { text: "", size: 8 },
    { text: "(a)  Business Plans & Strategy", bold: true, size: 11 },
    { text: "All business plans, financial projections, market analyses, and strategic materials.", size: 11 },
    { text: "", size: 8 },
    { text: "(b)  Technical Information", bold: true, size: 11 },
    { text: "Source code, algorithms, software designs, architecture documents, and APIs.", size: 11 },
    { text: "", size: 8 },
    { text: "(c)  Customer & Partner Data", bold: true, size: 11 },
    { text: "Customer lists, pricing information, partner agreements, and business relationships.", size: 11 },
    { text: "", size: 20 },
    { text: "ACKNOWLEDGMENT & SIGNATURES", bold: true, center: true, size: 13 },
    { text: "", size: 10 },
    { text: "By signing below, the Parties acknowledge they have read and agree to this Agreement.", size: 11 },
    { text: "", size: 20 },
    { text: "DISCLOSING PARTY:", bold: true, size: 11 },
    { text: "", size: 24 },
    { text: "____________________________________________", size: 11 },
    { text: "Authorized Signature                         Date", size: 10, muted: true },
    { text: "", size: 12 },
    { text: "RECEIVING PARTY:", bold: true, size: 11 },
    { text: "", size: 24 },
    { text: "____________________________________________", size: 11 },
    { text: "Authorized Signature                         Date", size: 10, muted: true },
  ],
];

interface DragState {
  fieldId: string;
  startMouseX: number;
  startMouseY: number;
  startFieldX: number;
  startFieldY: number;
}

interface Props {
  file: WizardFile | null;
  recipients: WizardRecipient[];
  fields: PlacedField[];
  setFields: React.Dispatch<React.SetStateAction<PlacedField[]>>;
  onNext: () => void;
  onBack: () => void;
}

// A single page rendered as a canvas (real PDF or demo text)
function DocumentPage({
  pageNum,
  totalPages,
  fileObject,
  fields,
  recipients,
  selectedFieldType,
  activeRecipient,
  onPlaceField,
  onMoveField,
  onRemoveField,
}: {
  pageNum: number;
  totalPages: number;
  fileObject?: File;
  fields: PlacedField[];
  recipients: WizardRecipient[];
  selectedFieldType: string;
  activeRecipient: string;
  onPlaceField: (page: number, x: number, y: number) => void;
  onMoveField: (id: string, x: number, y: number) => void;
  onRemoveField: (id: string) => void;
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<DragState | null>(null);
  const didDragRef = useRef(false);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    if (!fileObject) { setPdfUrl(null); setRenderError(false); return; }
    let cancelled = false;
    setLoading(true);
    setRenderError(false);
    setPdfUrl(null);
    (async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        const buf = await fileObject.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled) setPdfUrl(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        console.error('PDF render error:', err);
        if (!cancelled) setRenderError(true);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fileObject, pageNum]);

  const getColor = (recipientId: string) =>
    recipients.find(r => r.id === recipientId)?.color || "#3b82f6";

  const getFieldInfo = (type: string) =>
    FIELD_TYPES.find(ft => ft.type === type) || FIELD_TYPES[0];

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (didDragRef.current) { didDragRef.current = false; return; }
    if (!activeRecipient) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    // Store as percentage of page dimensions (0-100) for resolution independence
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    onPlaceField(pageNum, xPct, yPct);
  };

  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    draggingRef.current = {
      fieldId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startFieldX: field.x,
      startFieldY: field.y,
    };
    didDragRef.current = false;
    setDraggingId(fieldId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const ds = draggingRef.current;
    if (!ds || !canvasRef.current) return;
    const field = fields.find(f => f.id === ds.fieldId);
    if (!field) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - ds.startMouseX) / rect.width) * 100;
    const dy = ((e.clientY - ds.startMouseY) / rect.height) * 100;
    if (Math.abs(e.clientX - ds.startMouseX) > 2 || Math.abs(e.clientY - ds.startMouseY) > 2) didDragRef.current = true;
    const newX = Math.max(0, Math.min(ds.startFieldX + dx, 100 - field.width));
    const newY = Math.max(0, Math.min(ds.startFieldY + dy, 100 - field.height));
    onMoveField(ds.fieldId, newX, newY);
  };

  const handleMouseUp = () => {
    draggingRef.current = null;
    setDraggingId(null);
  };

  const pageFields = fields.filter(f => f.page === pageNum);
  const demoLines = DEMO_PAGES[(pageNum - 1) % DEMO_PAGES.length];

  return (
    <div className="w-full">
      <div
        ref={canvasRef}
        className="relative bg-white select-none w-full"
        style={{
          aspectRatio: "8.5 / 11",
          cursor: draggingId ? "grabbing" : "crosshair",
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        data-testid={`document-canvas-p${pageNum}`}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 border-2 border-[#c8210d] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Rendering page {pageNum}…</span>
            </div>
          </div>
        )}

        {/* Real PDF render */}
        {pdfUrl && !loading && (
          <img src={pdfUrl} alt={`Page ${pageNum}`} className="w-full h-auto pointer-events-none block" />
        )}

        {/* Render error state (real file uploaded but render failed) */}
        {fileObject && !loading && renderError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white pointer-events-none">
            <p className="text-xs text-muted-foreground">Could not render page {pageNum}</p>
          </div>
        )}

        {/* Demo text — only shown when NO real file is uploaded */}
        {!fileObject && !loading && (
          <div className="absolute inset-0 p-10 pointer-events-none overflow-hidden">
            {demoLines.map((line, i) => (
              <div key={i} style={{
                fontSize: line.size || 11,
                fontWeight: (line as any).bold ? "700" : "400",
                textAlign: (line as any).center ? "center" : "left",
                color: (line as any).muted ? "#9ca3af" : "#1a1a1a",
                lineHeight: 1.55,
                fontFamily: (line as any).bold ? "Arial, sans-serif" : "Georgia, serif",
              }}>
                {line.text || "\u00A0"}
              </div>
            ))}
          </div>
        )}

        {/* Placed fields */}
        {pageFields.map(f => {
          const color = getColor(f.recipientId);
          const ftInfo = getFieldInfo(f.type);
          const isDragging = draggingId === f.id;
          const isHovered = hoveredField === f.id;
          return (
            <div
              key={f.id}
              className="absolute rounded flex items-center justify-center group"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                width: `${f.width}%`,
                height: `${f.height}%`,
                border: `2px solid ${color}`,
                backgroundColor: `${color}18`,
                cursor: isDragging ? "grabbing" : "grab",
                zIndex: isDragging ? 50 : isHovered ? 20 : 10,
                boxShadow: isDragging
                  ? `0 6px 24px ${color}40`
                  : isHovered
                    ? `0 2px 10px ${color}30`
                    : "none",
                transition: isDragging ? "none" : "box-shadow 0.12s",
                userSelect: "none",
              }}
              onMouseDown={e => handleFieldMouseDown(e, f.id)}
              onMouseEnter={() => setHoveredField(f.id)}
              onMouseLeave={() => setHoveredField(null)}
            >
              <GripVertical
                className="absolute left-1 opacity-20 group-hover:opacity-60 transition-opacity"
                style={{ width: 11, height: 11, color }}
              />
              <div className="flex items-center gap-1 px-4">
                <ftInfo.icon style={{ width: 11, height: 11, color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color, fontWeight: 600, fontFamily: "system-ui", whiteSpace: "nowrap" }}>
                  {f.label}
                </span>
              </div>
              <button
                className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex"
                style={{ backgroundColor: "#ef4444", border: "2px solid white", zIndex: 60 }}
                onClick={e => { e.stopPropagation(); onRemoveField(f.id); }}
                onMouseDown={e => e.stopPropagation()}
              >
                <X style={{ width: 9, height: 9, color: "white" }} />
              </button>
            </div>
          );
        })}

        {/* Crosshair cursor hint on hover — no persistent badge */}
      </div>
    </div>
  );
}

export default function Step3Tag({ file, recipients, fields, setFields, onNext, onBack }: Props) {
  const [activeRecipient, setActiveRecipient] = useState(recipients[0]?.id || "");
  const [selectedFieldType, setSelectedFieldType] = useState<string>("signature");
  const totalPages = file?.pages || 3;

  const getRecipientColor = useCallback((recipientId: string) =>
    recipients.find(r => r.id === recipientId)?.color || "#3b82f6",
    [recipients]);

  const getFieldTypeInfo = (type: string) => FIELD_TYPES.find(ft => ft.type === type) || FIELD_TYPES[0];

  const handlePlaceField = useCallback((page: number, x: number, y: number) => {
    if (!activeRecipient) return;
    const size = FIELD_SIZES[selectedFieldType] || { w: 160, h: 40 };
    const ftInfo = getFieldTypeInfo(selectedFieldType);
    setFields(prev => [...prev, {
      id: `f-${Date.now()}-${page}`,
      type: selectedFieldType,
      page,
      x: Math.max(0, x - size.w / 2),
      y: Math.max(0, y - size.h / 2),
      width: size.w,
      height: size.h,
      recipientId: activeRecipient,
      label: ftInfo.label,
      required: true,
    }]);
  }, [activeRecipient, selectedFieldType, setFields]);

  const handleMoveField = useCallback((id: string, x: number, y: number) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, x, y } : f));
  }, [setFields]);

  const handleRemoveField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  }, [setFields]);

  const selectedFt = FIELD_TYPES.find(ft => ft.type === selectedFieldType) || FIELD_TYPES[0];

  // Height of the sticky top bar so sidebars stick just below it
  const STICKY_TOP = 16;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", width: "100%" }}>

      {/* ── LEFT: Assign To + Field Types (sticky) ── */}
      <div className="space-y-3" style={{ position: "sticky", top: STICKY_TOP, width: 188, flexShrink: 0 }}>
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Assign To</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {recipients.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No recipients</p>
            ) : (
              <div className="space-y-1">
                {recipients.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setActiveRecipient(r.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-left transition-all ${
                      activeRecipient === r.id ? "font-semibold" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                    style={activeRecipient === r.id ? { backgroundColor: `${r.color}15`, color: r.color } : {}}
                  >
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="truncate">{r.name || r.email || "Unnamed"}</span>
                    {activeRecipient === r.id && <span className="ml-auto opacity-50 text-[10px]">active</span>}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Field Type</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-0.5">
              {FIELD_TYPES.map(ft => (
                <button
                  key={ft.type}
                  onClick={() => setSelectedFieldType(ft.type)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-left transition-all ${
                    selectedFieldType === ft.type ? "font-semibold" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                  style={selectedFieldType === ft.type ? { backgroundColor: `${ft.color}15`, color: ft.color } : {}}
                >
                  <ft.icon className="h-3.5 w-3.5 shrink-0" style={selectedFieldType === ft.type ? { color: ft.color } : {}} />
                  {ft.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 px-1 leading-relaxed">
              Select a type then click the document to place.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── CENTER: Scrollable document — all pages stacked ── */}
      <div
        className="rounded-xl"
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: "#d1d5db",
          height: "calc(100vh - 200px)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Active placement indicator — sticky bar at top */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            backgroundColor: "#d1d5db",
            padding: "12px 20px 8px",
          }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border"
            style={{
              backgroundColor: `${selectedFt.color}10`,
              borderColor: `${selectedFt.color}30`,
              color: selectedFt.color,
              backdropFilter: "blur(4px)",
            }}
          >
            <selectedFt.icon className="h-3.5 w-3.5 shrink-0" />
            <span>Placing: <strong>{selectedFt.label}</strong></span>
            {(() => {
              const r = recipients.find(rec => rec.id === activeRecipient);
              return r ? (
                <span className="ml-auto flex items-center gap-1.5 font-normal" style={{ color: r.color }}>
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                  {r.name || r.email}
                </span>
              ) : null;
            })()}
          </div>
        </div>

        {/* All pages stacked — fluid width filling the scroll pane */}
        <div style={{ padding: "8px 20px 40px", display: "flex", flexDirection: "column", gap: 28 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <div key={pageNum}>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 6, paddingLeft: 2 }}>
                Page {pageNum} of {totalPages}
              </div>
              <DocumentPage
                pageNum={pageNum}
                totalPages={totalPages}
                fileObject={file?.fileObject}
                fields={fields}
                recipients={recipients}
                selectedFieldType={selectedFieldType}
                activeRecipient={activeRecipient}
                onPlaceField={handlePlaceField}
                onMoveField={handleMoveField}
                onRemoveField={handleRemoveField}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Placed fields + actions (sticky) ── */}
      <div className="space-y-3" style={{ position: "sticky", top: STICKY_TOP, width: 212, flexShrink: 0 }}>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              Placed Fields
              {fields.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{fields.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {fields.length === 0 ? (
              <div className="text-center py-8">
                <PenTool className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">No fields placed yet</p>
                <p className="text-[10px] text-muted-foreground mt-1">Click on the document to add fields</p>
              </div>
            ) : (
              <div className="space-y-1.5" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                {fields.map(f => {
                  const recipient = recipients.find(r => r.id === f.recipientId);
                  const ftInfo = getFieldTypeInfo(f.type);
                  const color = getRecipientColor(f.recipientId);
                  return (
                    <div key={f.id} className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted/40 transition-colors group">
                      <div className="h-6 w-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                        <ftInfo.icon style={{ width: 12, height: 12, color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{f.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">p.{f.page} · {recipient?.name || "Unassigned"}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveField(f.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {fields.length > 0 && (
          <Button
            variant="outline" size="sm"
            className="w-full text-xs text-destructive hover:text-destructive"
            onClick={() => setFields([])}
          >
            Clear all fields
          </Button>
        )}

        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={onBack} className="w-full" data-testid="step3-back">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button
            className="bg-[#c8210d] hover:bg-[#a61b0b] text-white w-full"
            onClick={onNext}
            data-testid="step3-next"
          >
            Next: Review & Send
          </Button>
        </div>
      </div>
    </div>
  );
}
