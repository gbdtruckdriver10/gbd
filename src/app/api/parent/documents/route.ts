import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const REQUIRED_PER_CHILD = [
  { document_type: "emergency_contact", document_name: "Emergency Contact Form", category: "Required" },
  { document_type: "medical_authorization", document_name: "Medical Authorization", category: "Required" },
  { document_type: "immunization_records", document_name: "Immunization Records", category: "Medical" },
];

const REQUIRED_FAMILY = [
  { document_type: "authorized_pickup", document_name: "Authorized Pickup List", category: "Required" },
];

const REFERENCE_DOCS = [
  { document_type: "parent_handbook", document_name: "Parent Handbook 2026", category: "General" },
];

export const TEMPLATE_PATHS: Record<string, string> = {
  emergency_contact: "/forms/emergency-contact-form.pdf",
  medical_authorization: "/forms/medical-authorization.pdf",
  immunization_records: "/forms/immunization-records.pdf",
  authorized_pickup: "/forms/authorized-pickup-list.pdf",
  parent_handbook: "/forms/parent-handbook-2026.pdf",
};

export async function GET(req: NextRequest) {
  const parentId = new URL(req.url).searchParams.get("parentId");
  if (!parentId) return NextResponse.json({ error: "parentId required" }, { status: 400 });

  const [childrenResult, docsResult] = await Promise.all([
    pool.query(
      `SELECT ch.child_id, ch.first_name, ch.last_name
       FROM parent_child_relationships pcr
       JOIN children ch ON ch.child_id = pcr.child_id
       WHERE pcr.parent_user_id = $1
       ORDER BY ch.first_name`,
      [parentId]
    ),
    pool.query(
      `SELECT * FROM parent_documents WHERE parent_user_id = $1 ORDER BY created_at DESC`,
      [parentId]
    ),
  ]);

  const children = childrenResult.rows;
  const uploaded = docsResult.rows;

  const items: object[] = [];

  // Per-child required documents
  for (const child of children) {
    for (const req of REQUIRED_PER_CHILD) {
      const found = uploaded.find(
        (d) => d.child_id === child.child_id && d.document_type === req.document_type
      );
      items.push(
        found
          ? { ...found, child_name: `${child.first_name} ${child.last_name}`, template_path: TEMPLATE_PATHS[req.document_type] ?? null }
          : {
              document_id: null,
              document_type: req.document_type,
              document_name: req.document_name,
              category: req.category,
              child_id: child.child_id,
              child_name: `${child.first_name} ${child.last_name}`,
              status: "pending",
              file_name: null,
              file_url: null,
              uploaded_at: null,
              template_path: TEMPLATE_PATHS[req.document_type] ?? null,
            }
      );
    }
  }

  // Family-level required documents
  for (const req of REQUIRED_FAMILY) {
    const found = uploaded.find(
      (d) => d.child_id === null && d.document_type === req.document_type
    );
    items.push(
      found
        ? { ...found, child_name: "Family", template_path: TEMPLATE_PATHS[req.document_type] ?? null }
        : {
            document_id: null,
            document_type: req.document_type,
            document_name: req.document_name,
            category: req.category,
            child_id: null,
            child_name: "Family",
            status: "pending",
            file_name: null,
            file_url: null,
            uploaded_at: null,
            template_path: TEMPLATE_PATHS[req.document_type] ?? null,
          }
    );
  }

  // Read-only reference documents (download only, no upload required)
  for (const doc of REFERENCE_DOCS) {
    items.push({
      document_id: null,
      document_type: doc.document_type,
      document_name: doc.document_name,
      category: doc.category,
      child_id: null,
      child_name: "Family",
      status: "complete",
      file_name: null,
      file_url: null,
      uploaded_at: null,
      template_path: TEMPLATE_PATHS[doc.document_type] ?? null,
    });
  }

  // Any extra uploads not matching required types
  const coveredTypes = new Set(
    items.map((i: any) => `${i.child_id ?? "family"}_${i.document_type}`)
  );
  for (const doc of uploaded) {
    const key = `${doc.child_id ?? "family"}_${doc.document_type}`;
    if (!coveredTypes.has(key)) {
      const child = children.find((c) => c.child_id === doc.child_id);
      items.push({
        ...doc,
        child_name: child ? `${child.first_name} ${child.last_name}` : "Family",
        template_path: null,
      });
    }
  }

  return NextResponse.json(items);
}
