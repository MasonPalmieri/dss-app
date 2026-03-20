import { useState, useRef, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  PenTool,
  Type,
  Upload,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
  X,
} from "lucide-react";
import { useHashLocation } from "wouter/use-hash-location";

export default function SigningPage() {
  const [location] = useHashLocation();
  // Extract token from URL: /sign/:token
  const tokenMatch = location.match(/\/sign\/([^/]+)/);
  const token = tokenMatch?.[1] || "";

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signatureTab, setSignatureTab] = useState("type");
  const [typedName, setTypedName] = useState("");
  const [completed, setCompleted] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Fetch document data by token
  const { data: signingData, isLoading } = useQuery<any>({
    queryKey: [`/api/sign/${token}`],
    enabled: !!token,
  });

  const document = signingData?.document;
  const recipient = signingData?.recipient;
  const fields = signingData?.fields || [];

  const currentField = fields[currentFieldIndex];

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/sign/${token}/complete`, {
        fields: fieldValues,
        signature: signatureData,
      });
    },
    onSuccess: () => {
      setCompleted(true);
    },
  });

  // Helpers to get position from mouse or touch event
  const getPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Canvas drawing — mouse
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getPos(canvas, e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(canvas, e.clientX, e.clientY);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  // Canvas drawing — touch
  const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const touch = e.touches[0];
    const { x, y } = getPos(canvas, touch.clientX, touch.clientY);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const touchDraw = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const touch = e.touches[0];
    const { x, y } = getPos(canvas, touch.clientX, touch.clientY);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const applySignature = () => {
    if (signatureTab === "type" && typedName) {
      setSignatureData(`typed:${typedName}`);
    }
    if (currentField) {
      setFieldValues((prev) => ({
        ...prev,
        [currentField.id]: signatureTab === "type" ? typedName : signatureData || "",
      }));
    }
    setShowSignModal(false);
  };

  const handleFieldAction = () => {
    if (!currentField) return;
    if (currentField.type === "signature" || currentField.type === "initials") {
      setShowSignModal(true);
    } else {
      // Auto-fill for other field types
      const autoValue = currentField.type === "date"
        ? new Date().toLocaleDateString()
        : currentField.type === "name"
        ? recipient?.name || ""
        : currentField.type === "company"
        ? "Company Name"
        : currentField.type === "title"
        ? "Title"
        : "";
      if (autoValue) {
        setFieldValues((prev) => ({ ...prev, [currentField.id]: autoValue }));
      }
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-8 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Document Signed</h1>
            <p className="text-muted-foreground">
              Thank you for signing. All parties will receive a copy once the document is fully executed.
            </p>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p>Signed by: {recipient?.name || "You"}</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
            <p className="text-xs text-muted-foreground">You may close this window.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#c8210d] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#c8210d] text-white">
              <PenTool className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">DraftSendSign</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {fields.length > 0
                ? `Field ${currentFieldIndex + 1} of ${fields.length}`
                : "No fields"}
            </Badge>
            <Button
              className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
              size="sm"
              disabled={Object.keys(fieldValues).length < fields.filter((f: any) => f.required).length}
              onClick={() => submitMutation.mutate()}
              data-testid="finish-signing"
            >
              <Check className="h-4 w-4 mr-1" />
              Finish
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 grid lg:grid-cols-[1fr_280px] gap-4">
        {/* Document Canvas */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted/30 p-4">
              <div
                className="relative bg-white dark:bg-gray-900 shadow-md mx-auto"
                style={{ width: "100%", maxWidth: 612, aspectRatio: "8.5/11" }}
                data-testid="signing-canvas"
              >
                {/* Mock page lines */}
                <div className="absolute inset-0 p-12 space-y-3 pointer-events-none opacity-20">
                  {[...Array(25)].map((_, i) => (
                    <div key={i} className="h-2 bg-gray-400 rounded" style={{ width: `${60 + Math.random() * 35}%` }} />
                  ))}
                </div>

                {/* Fields */}
                {fields.map((f: any, idx: number) => {
                  const isFilled = !!fieldValues[f.id];
                  const isCurrent = idx === currentFieldIndex;
                  return (
                    <div
                      key={f.id}
                      className={`absolute border-2 rounded cursor-pointer flex items-center justify-center transition-all ${
                        isCurrent
                          ? "border-[#c8210d] bg-[#c8210d]/10 ring-2 ring-[#c8210d]/30"
                          : isFilled
                          ? "border-green-500 bg-green-500/10"
                          : "border-gray-300 bg-gray-100/50"
                      }`}
                      style={{
                        left: f.x,
                        top: f.y,
                        width: f.width || 180,
                        height: f.height || 50,
                      }}
                      onClick={() => {
                        setCurrentFieldIndex(idx);
                        if (f.type === "signature" || f.type === "initials") {
                          setShowSignModal(true);
                        }
                      }}
                      data-testid={`signing-field-${f.id}`}
                    >
                      {isFilled ? (
                        <span className="text-xs font-medium text-green-700 truncate px-1">
                          {fieldValues[f.id]?.startsWith("typed:") ? fieldValues[f.id].replace("typed:", "") : fieldValues[f.id]?.startsWith("data:") ? "Signed" : fieldValues[f.id]}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">{f.label || f.type}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Field Navigator */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{document?.title || "Document"}</span>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Sent by: {document?.senderName || "Unknown"}
              </p>
              {document?.message && (
                <p className="text-xs text-muted-foreground italic">"{document.message}"</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-3">Fields to Complete</h3>
              <div className="space-y-2">
                {fields.map((f: any, idx: number) => {
                  const isFilled = !!fieldValues[f.id];
                  return (
                    <button
                      key={f.id}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors ${
                        idx === currentFieldIndex
                          ? "bg-[#c8210d]/10 text-[#c8210d] font-medium"
                          : isFilled
                          ? "bg-green-500/10 text-green-700"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => {
                        setCurrentFieldIndex(idx);
                        handleFieldAction();
                      }}
                      data-testid={`field-nav-${idx}`}
                    >
                      {isFilled ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-current shrink-0" />
                      )}
                      <span className="truncate">{f.label || f.type}</span>
                      {f.required && !isFilled && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1 ml-auto">Required</Badge>
                      )}
                    </button>
                  );
                })}
              </div>

              {fields.length > 1 && (
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={currentFieldIndex <= 0}
                    onClick={() => setCurrentFieldIndex((i) => i - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={currentFieldIndex >= fields.length - 1}
                    onClick={() => {
                      setCurrentFieldIndex((i) => i + 1);
                    }}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Signature Modal */}
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentField?.type === "initials" ? "Add Your Initials" : "Add Your Signature"}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={signatureTab} onValueChange={setSignatureTab}>
            <TabsList className="w-full">
              <TabsTrigger value="type" className="flex-1 gap-1.5">
                <Type className="h-4 w-4" /> Type
              </TabsTrigger>
              <TabsTrigger value="draw" className="flex-1 gap-1.5">
                <PenTool className="h-4 w-4" /> Draw
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 gap-1.5">
                <Upload className="h-4 w-4" /> Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="mt-4">
              <Input
                placeholder="Type your full name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="text-center"
                data-testid="signature-typed-input"
              />
              {typedName && (
                <div className="mt-3 p-4 border rounded-lg text-center">
                  <p className="text-2xl font-signature italic text-gray-800 dark:text-gray-200" style={{ fontFamily: "cursive" }}>
                    {typedName}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="draw" className="mt-4">
              <div className="border rounded-lg p-1 relative">
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={150}
                  className="w-full cursor-crosshair bg-white dark:bg-gray-900 rounded touch-none"
                  style={{ touchAction: "none" }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startTouchDrawing}
                  onTouchMove={touchDraw}
                  onTouchEnd={stopTouchDrawing}
                  data-testid="signature-canvas"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearCanvas}
                >
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Draw your signature above</p>
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[#c8210d]/50 transition-colors"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setSignatureData(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload a signature image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
              </div>
              {signatureData && signatureData.startsWith("data:image") && (
                <div className="mt-3 p-2 border rounded-lg text-center">
                  <img src={signatureData} alt="Uploaded signature" className="max-h-20 mx-auto" />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignModal(false)}>Cancel</Button>
            <Button
              className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
              onClick={applySignature}
              disabled={signatureTab === "type" ? !typedName : !signatureData}
              data-testid="apply-signature"
            >
              Apply Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
