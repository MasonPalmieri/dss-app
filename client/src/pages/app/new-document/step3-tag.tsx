import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PenTool, Type, Calendar, User, Hash, CheckSquare,
  Building2, Briefcase, ArrowLeft, X, ChevronLeft, ChevronRight, GripVertical,
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

const FIELD_SIZES: Record<string, { w: number; h: number }> = {
  signature: { w: 200, h: 56 },
  initials: { w: 80, h: 44 },
  date: { w: 140, h: 36 },
  name: { w: 180, h: 36 },
  text: { w: 180, h: 36 },
  checkbox: { w: 28, h: 28 },
  company: { w: 180, h: 36 },
  title: { w: 160, h: 36 },
};

// Realistic NDA document content lines
const DOC_LINES = [
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
  { text: "Upon request, the Receiving Party shall promptly return or destroy all Confidential Information", size: 11 },
  { text: "and any copies, extracts, or other reproductions thereof.", size: 11 },
  { text: "", size: 10 },
  { text: "5.  REMEDIES", bold: true, size: 12 },
  { text: "The Parties acknowledge that any breach of this Agreement may cause irreparable harm for which", size: 11 },
  { text: "monetary damages would be an inadequate remedy. Each Party shall be entitled to seek equitable", size: 11 },
  { text: "relief, including injunction and specific performance, in addition to all other remedies.", size: 11 },
  { text: "", size: 16 },
  { text: "SIGNATURES", bold: true, center: true, size: 13 },
  { text: "", size: 12 },
  { text: "DISCLOSING PARTY:", bold: true, size: 11 },
  { text: "", size: 28 },  // signature line space
  { text: "____________________________________________", size: 11 },
  { text: "Signature                                    Date", size: 10, muted: true },
  { text: "", size: 12 },
  { text: "RECEIVING PARTY:", bold: true, size: 11 },
  { text: "", size: 28 },  // signature line space
  { text: "____________________________________________", size: 11 },
  { text: "Signature                                    Date", size: 10, muted: true },
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

export default function Step3Tag({ file, recipients, fields, setFields, onNext, onBack }: Props) {
  const [activeRecipient, setActiveRecipient] = useState(recipients[0]?.id || "");
  const [selectedFieldType, setSelectedFieldType] = useState<string>("signature");
  const [currentPage, setCurrentPage] = useState(1);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  // Track whether a drag actually moved the field so we can suppress the post-drag click
  const didDragRef = useRef(false);
  const draggingRef = useRef<DragState | null>(null);
  const totalPages = file?.pages || 1;

  const getRecipientColor = useCallback((recipientId: string) => {
    return recipients.find(r => r.id === recipientId)?.color || "#3b82f6";
  }, [recipients]);

  const getFieldTypeInfo = (type: string) => FIELD_TYPES.find(ft => ft.type === type) || FIELD_TYPES[0];

  // Place field on canvas click (only if not dragging)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Suppress click if we just finished a drag
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (!activeRecipient) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = FIELD_SIZES[selectedFieldType] || { w: 160, h: 40 };
    const ftInfo = getFieldTypeInfo(selectedFieldType);

    const newField: PlacedField = {
      id: `f-${Date.now()}`,
      type: selectedFieldType,
      page: currentPage,
      x: Math.max(0, Math.min(x - size.w / 2, (canvasRef.current?.offsetWidth || 612) - size.w)),
      y: Math.max(0, Math.min(y - size.h / 2, (canvasRef.current?.offsetHeight || 792) - size.h)),
      width: size.w,
      height: size.h,
      recipientId: activeRecipient,
      label: ftInfo.label,
      required: true,
    };
    setFields(prev => [...prev, newField]);
  };

  // Drag start on a field
  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    const ds: DragState = {
      fieldId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startFieldX: field.x,
      startFieldY: field.y,
    };
    draggingRef.current = ds;
    setDragging(ds);
    didDragRef.current = false;
  };

  // Drag move
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const currentDrag = draggingRef.current;
    if (!currentDrag || !canvasRef.current) return;
    const field = fields.find(f => f.id === currentDrag.fieldId);
    if (!field) return;
    const canvasW = canvasRef.current.offsetWidth;
    const canvasH = canvasRef.current.offsetHeight;
    const dx = e.clientX - currentDrag.startMouseX;
    const dy = e.clientY - currentDrag.startMouseY;
    // Only register as a drag if moved more than 3px
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      didDragRef.current = true;
    }
    const newX = Math.max(0, Math.min(currentDrag.startFieldX + dx, canvasW - field.width));
    const newY = Math.max(0, Math.min(currentDrag.startFieldY + dy, canvasH - field.height));
    setFields(prev => prev.map(f => f.id === currentDrag.fieldId ? { ...f, x: newX, y: newY } : f));
  };

  const handleCanvasMouseUp = () => {
    draggingRef.current = null;
    setDragging(null);
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const pageFields = fields.filter(f => f.page === currentPage);

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[200px_1fr_240px] gap-4 min-h-0">

        {/* LEFT: Recipients + Field Types */}
        <div className="space-y-3 overflow-y-auto">
          {/* Recipient selector */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Assign To</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {recipients.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No recipients added</p>
              ) : (
                <div className="space-y-1">
                  {recipients.map(r => (
                    <button
                      key={r.id}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-left transition-all ${
                        activeRecipient === r.id
                          ? "ring-1 font-medium"
                          : "hover:bg-muted/60"
                      }`}
                      style={activeRecipient === r.id ? { ringColor: r.color, backgroundColor: `${r.color}12` } : {}}
                      onClick={() => setActiveRecipient(r.id)}
                      data-testid={`select-recipient-${r.id}`}
                    >
                      <div className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white" style={{ backgroundColor: r.color }} />
                      <span className="truncate text-xs">{r.name || r.email || "Unnamed"}</span>
                      {activeRecipient === r.id && (
                        <span className="ml-auto text-[10px] opacity-60">active</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field type picker */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Field Types</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-0.5">
                {FIELD_TYPES.map(ft => (
                  <button
                    key={ft.type}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-left transition-all ${
                      selectedFieldType === ft.type
                        ? "font-semibold ring-1"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                    style={selectedFieldType === ft.type
                      ? { backgroundColor: `${ft.color}15`, color: ft.color, outlineColor: ft.color }
                      : {}}
                    onClick={() => setSelectedFieldType(ft.type)}
                    data-testid={`field-type-${ft.type}`}
                  >
                    <ft.icon className="h-3.5 w-3.5 shrink-0" style={selectedFieldType === ft.type ? { color: ft.color } : {}} />
                    {ft.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 px-1">
                Select a type, then click anywhere on the document to place it.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CENTER: Document Canvas */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-slate-200 dark:bg-slate-800 p-4 flex flex-col items-center min-h-[600px]">
              <div
                ref={canvasRef}
                className="relative bg-white shadow-xl mx-auto select-none"
                style={{
                  width: "100%",
                  maxWidth: 560,
                  minHeight: 726,
                  cursor: dragging ? "grabbing" : "crosshair",
                  fontFamily: "Georgia, serif",
                }}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                data-testid="document-canvas"
              >
                {/* Document content */}
                <div className="absolute inset-0 p-10 overflow-hidden pointer-events-none">
                  {DOC_LINES.map((line, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: line.size || 11,
                        fontWeight: line.bold ? "700" : "400",
                        textAlign: line.center ? "center" : "left",
                        color: line.muted ? "#9ca3af" : "#1a1a1a",
                        lineHeight: 1.5,
                        marginBottom: 0,
                        fontFamily: line.bold ? "Arial, sans-serif" : "Georgia, serif",
                      }}
                    >
                      {line.text || "\u00A0"}
                    </div>
                  ))}
                </div>

                {/* Placed fields */}
                {pageFields.map(f => {
                  const recipColor = getRecipientColor(f.recipientId);
                  const ftInfo = getFieldTypeInfo(f.type);
                  const isHovered = hoveredField === f.id;
                  const isDraggingThis = dragging?.fieldId === f.id;

                  return (
                    <div
                      key={f.id}
                      className="absolute flex items-center justify-center rounded-sm border-2 group"
                      style={{
                        left: f.x,
                        top: f.y,
                        width: f.width,
                        height: f.height,
                        borderColor: recipColor,
                        backgroundColor: `${recipColor}18`,
                        cursor: isDraggingThis ? "grabbing" : "grab",
                        zIndex: isDraggingThis ? 50 : isHovered ? 20 : 10,
                        boxShadow: isDraggingThis ? `0 4px 20px ${recipColor}50` : isHovered ? `0 2px 8px ${recipColor}30` : "none",
                        transition: isDraggingThis ? "none" : "box-shadow 0.15s",
                        userSelect: "none",
                      }}
                      onMouseDown={(e) => handleFieldMouseDown(e, f.id)}
                      onMouseEnter={() => setHoveredField(f.id)}
                      onMouseLeave={() => setHoveredField(null)}
                      data-testid={`placed-field-${f.id}`}
                    >
                      {/* Drag handle */}
                      <GripVertical
                        className="absolute left-1 opacity-30 group-hover:opacity-70 transition-opacity"
                        style={{ width: 12, height: 12, color: recipColor }}
                      />

                      {/* Field content */}
                      <div className="flex items-center gap-1 px-4">
                        <ftInfo.icon style={{ width: 11, height: 11, color: recipColor, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: recipColor, fontWeight: 600, fontFamily: "system-ui", whiteSpace: "nowrap" }}>
                          {f.label}
                        </span>
                      </div>

                      {/* Delete button */}
                      <button
                        className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: "#ef4444", border: "2px solid white" }}
                        onClick={(e) => { e.stopPropagation(); removeField(f.id); }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <X style={{ width: 10, height: 10, color: "white" }} />
                      </button>
                    </div>
                  );
                })}

                {/* Empty state hint */}
                {pageFields.length === 0 && (
                  <div
                    className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none"
                    style={{ zIndex: 5 }}
                  >
                    <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                      Click anywhere on the document to place a field
                    </div>
                  </div>
                )}
              </div>

              {/* Page navigation */}
              {totalPages > 1 && (
                <div className="flex items-center gap-3 mt-4">
                  <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Placed Fields list */}
        <div className="space-y-3">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Placed Fields
                {fields.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5">{fields.length}</Badge>
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
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                  {fields.map(f => {
                    const recipient = recipients.find(r => r.id === f.recipientId);
                    const ftInfo = getFieldTypeInfo(f.type);
                    return (
                      <div
                        key={f.id}
                        className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted/40 transition-colors group"
                      >
                        <div className="h-6 w-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${getRecipientColor(f.recipientId)}20` }}>
                          <ftInfo.icon style={{ width: 12, height: 12, color: getRecipientColor(f.recipientId) }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{f.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            p.{f.page} · {recipient?.name || "Unassigned"}
                          </p>
                        </div>
                        <button
                          onClick={() => removeField(f.id)}
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
              variant="outline"
              size="sm"
              className="w-full text-xs text-destructive hover:text-destructive"
              onClick={() => setFields([])}
            >
              Clear all fields
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} data-testid="step3-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
          onClick={onNext}
          data-testid="step3-next"
        >
          Next: Review & Send
        </Button>
      </div>
    </div>
  );
}
