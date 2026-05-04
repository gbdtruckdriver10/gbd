"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AlertCircle, CheckCircle, Download, File, FileText, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type DocItem = {
  document_id: number | null;
  document_type: string;
  document_name: string;
  category: string;
  child_id: number | null;
  child_name: string;
  status: "complete" | "pending";
  file_name: string | null;
  uploaded_at: string | null;
  template_path: string | null;
};

const DOCUMENT_TYPES = [
  { value: "emergency_contact", label: "Emergency Contact Form", category: "Required" },
  { value: "medical_authorization", label: "Medical Authorization", category: "Required" },
  { value: "immunization_records", label: "Immunization Records", category: "Medical" },
  { value: "authorized_pickup", label: "Authorized Pickup List", category: "Required" },
  { value: "parent_handbook", label: "Parent Handbook 2026", category: "General" },
  { value: "other", label: "Other", category: "General" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Required: "bg-red-100 text-red-700",
  Medical: "bg-blue-100 text-blue-700",
  General: "bg-gray-100 text-gray-700",
  Legal: "bg-purple-100 text-purple-700",
};

export default function ParentDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [children, setChildren] = useState<{ child_id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [prefill, setPrefill] = useState<Partial<DocItem> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("");
  const [childFor, setChildFor] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = () => {
    if (!user?.id) return;
    fetch(`/api/parent/documents?parentId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setDocuments(data);
        const names = Array.from(
          new Map(
            data
              .filter((d: DocItem) => d.child_id !== null)
              .map((d: DocItem) => [d.child_id, { child_id: d.child_id!, name: d.child_name }])
          ).values()
        ) as { child_id: number; name: string }[];
        setChildren(names);
        setLoading(false);
      });
  };

  useEffect(() => { fetchDocuments(); }, [user?.id]);

  const completeCount = documents.filter((d) => d.status === "complete").length;
  const pendingCount = documents.filter((d) => d.status === "pending").length;

  const openUpload = (doc?: DocItem) => {
    setPrefill(doc ?? null);
    setDocType(doc?.document_type ?? "");
    setChildFor(doc?.child_id ? String(doc.child_id) : doc?.child_name === "Family" ? "family" : "");
    setSelectedFile(null);
    setUploadOpen(true);
  };

  const resetForm = () => {
    setUploadOpen(false);
    setPrefill(null);
    setSelectedFile(null);
    setDocType("");
    setChildFor("");
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; }
    setSelectedFile(file ?? null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file && file.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !docType || !childFor || !user?.id) {
      toast.error("Please fill in all fields and choose a file");
      return;
    }

    const selected = DOCUMENT_TYPES.find((t) => t.value === docType);
    if (!selected) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("parentId", String(user.id));
    formData.append("childId", childFor);
    formData.append("documentType", docType);
    formData.append("documentName", selected.label);
    formData.append("category", selected.category);

    const res = await fetch("/api/parent/documents/upload", { method: "POST", body: formData });

    if (res.ok) {
      toast.success("Document uploaded successfully");
      resetForm();
      fetchDocuments();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Upload failed");
    }
    setUploading(false);
  };

  const handleDownload = (doc: DocItem) => {
    if (!doc.document_id) return;
    window.open(`/api/parent/documents/${doc.document_id}/download`, "_blank");
  };

  const handleTemplateDownload = (doc: DocItem) => {
    if (!doc.template_path) return;
    window.open(doc.template_path, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[#002040]">Documents</h1>
          <p className="text-gray-600">Manage forms, records, and uploads for your family.</p>
        </div>
        <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={() => openUpload()}>
          <Upload className="mr-2" size={18} />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <CheckCircle className="mx-auto mb-2 text-[#489858]" size={42} />
            <p className="mb-1 text-3xl font-bold text-[#489858]">{completeCount}</p>
            <p className="text-sm text-gray-600">Complete Documents</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto mb-2 text-[#E8A018]" size={42} />
            <p className="mb-1 text-3xl font-bold text-[#E8A018]">{pendingCount}</p>
            <p className="text-sm text-gray-600">Pending Documents</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <div
                key={`${doc.document_type}-${doc.child_id ?? "family"}-${i}`}
                className="flex flex-col gap-4 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="rounded-lg bg-[#2888B8]/10 p-2">
                    <FileText className="text-[#2888B8]" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#002040]">{doc.document_name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <Badge variant="secondary" className={CATEGORY_COLORS[doc.category] ?? ""}>
                        {doc.category}
                      </Badge>
                      <span>{doc.child_name}</span>
                      {doc.uploaded_at
                        ? <span>Updated: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        : <span>No upload yet</span>}
                      {doc.file_name && <span className="truncate">{doc.file_name}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.status === "complete" ? (
                    <Badge className="border-green-200 bg-green-100 text-green-700">
                      <CheckCircle className="mr-1" size={14} />Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-200 bg-orange-100 text-orange-700">
                      <AlertCircle className="mr-1" size={14} />Pending
                    </Badge>
                  )}

                  {doc.template_path && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 hover:text-[#2888B8]"
                      onClick={() => handleTemplateDownload(doc)}
                    >
                      <Download size={14} className="mr-1" />
                      Template
                    </Button>
                  )}

                  {doc.status === "pending" ? (
                    <Button
                      size="sm"
                      className="bg-[#2888B8] hover:bg-[#1078A8] text-xs"
                      onClick={() => openUpload(doc)}
                    >
                      <Upload size={14} className="mr-1" />
                      Upload
                    </Button>
                  ) : doc.document_id ? (
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                      <Download size={16} />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">
              {prefill ? `Upload: ${prefill.document_name}` : "Upload Document"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType} disabled={!!prefill}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>For</Label>
              <Select value={childFor} onValueChange={setChildFor} disabled={!!prefill}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select child or family" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((c) => (
                    <SelectItem key={c.child_id} value={String(c.child_id)}>{c.name}</SelectItem>
                  ))}
                  <SelectItem value="family">Family / Parent Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>File</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile ? (
                <div className="mt-2 flex items-center gap-3 rounded-xl bg-blue-50 p-3">
                  <File className="text-[#2888B8]" size={20} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#002040]">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`mt-2 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                    isDragging ? "border-[#2888B8] bg-blue-50" : "border-gray-300 hover:border-[#2888B8] hover:bg-blue-50/50"
                  }`}
                >
                  <Upload className="mx-auto mb-2 text-gray-400" size={30} />
                  <p className="text-sm font-medium text-[#002040]">Drag and drop a file here</p>
                  <p className="mt-1 text-sm text-gray-600">or click to choose a file</p>
                  <p className="mt-1 text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG — max 10MB</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button
              className="bg-[#2888B8] hover:bg-[#1078A8]"
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !docType || !childFor}
            >
              <Upload className="mr-2" size={16} />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
