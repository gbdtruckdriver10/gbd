"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type ChildRow = {
  child_id: number;
  name: string;
  docs: Record<string, boolean>;
};

type ParentRow = {
  parent_id: number;
  parent_name: string;
  children: ChildRow[];
  family_docs: Record<string, boolean>;
  total_required: number;
  total_complete: number;
};

const CHILD_DOC_LABELS: Record<string, string> = {
  emergency_contact: "Emergency Contact",
  medical_authorization: "Medical Auth",
  immunization_records: "Immunization",
};

const FAMILY_DOC_LABELS: Record<string, string> = {
  authorized_pickup: "Authorized Pickup",
};

function DocIndicator({ complete, label }: { complete: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      {complete
        ? <CheckCircle size={14} className="shrink-0 text-green-500" />
        : <XCircle size={14} className="shrink-0 text-red-400" />}
      <span className={complete ? "text-gray-600" : "text-red-500 font-medium"}>{label}</span>
    </div>
  );
}

export default function AdminDocumentsPage() {
  const [parents, setParents] = useState<ParentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/documents")
      .then((r) => r.json())
      .then((data) => { setParents(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  const allComplete = parents.filter((p) => p.total_complete === p.total_required).length;
  const incomplete = parents.length - allComplete;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-[#002040]">Document Compliance</h1>
        <p className="text-gray-600">Overview of required document submissions per family.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <CheckCircle className="mx-auto mb-2 text-[#489858]" size={42} />
            <p className="mb-1 text-3xl font-bold text-[#489858]">{allComplete}</p>
            <p className="text-sm text-gray-600">Fully Complete Families</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <XCircle className="mx-auto mb-2 text-red-400" size={42} />
            <p className="mb-1 text-3xl font-bold text-red-400">{incomplete}</p>
            <p className="text-sm text-gray-600">Families with Missing Docs</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {parents.map((parent) => {
          const isComplete = parent.total_complete === parent.total_required;
          return (
            <Card key={parent.parent_id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-[#002040]">{parent.parent_name}</p>
                    <Badge
                      className={isComplete
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"}
                    >
                      {parent.total_complete}/{parent.total_required} complete
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {parent.children.map((child) => (
                    <div key={child.child_id} className="rounded-lg bg-gray-50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{child.name}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1">
                        {Object.entries(CHILD_DOC_LABELS).map(([type, label]) => (
                          <DocIndicator key={type} complete={child.docs[type] ?? false} label={label} />
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Family</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      {Object.entries(FAMILY_DOC_LABELS).map(([type, label]) => (
                        <DocIndicator key={type} complete={parent.family_docs[type] ?? false} label={label} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
