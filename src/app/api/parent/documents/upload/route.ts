import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const parentId = formData.get("parentId") as string;
  const childId = formData.get("childId") as string; // "family" or a number
  const documentType = formData.get("documentType") as string;
  const documentName = formData.get("documentName") as string;
  const category = formData.get("category") as string;

  if (!file || !parentId || !documentType || !documentName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "pdf";
  const isFamily = childId === "family" || !childId;
  const storagePath = isFamily
    ? `${parentId}/family/${documentType}.${ext}`
    : `${parentId}/${childId}/${documentType}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log("[upload] supabaseUrl:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("[upload] serviceKeyPrefix:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20));
  console.log("[upload] storagePath:", storagePath);

  const { error: storageError } = await supabaseAdmin.storage
    .from("parent-uploads")
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });

  if (storageError) {
    console.error("[upload] storage error:", storageError);
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const dbChildId = isFamily ? null : Number(childId);

  // Upsert — update existing record or insert new one
  const existing = await pool.query(
    `SELECT document_id FROM parent_documents
     WHERE parent_user_id = $1 AND document_type = $2 AND ($3::int IS NULL AND child_id IS NULL OR child_id = $3)`,
    [parentId, documentType, dbChildId]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE parent_documents
       SET file_name = $1, file_url = $2, status = 'complete', uploaded_at = NOW()
       WHERE document_id = $3`,
      [file.name, storagePath, existing.rows[0].document_id]
    );
  } else {
    await pool.query(
      `INSERT INTO parent_documents (parent_user_id, child_id, document_type, document_name, file_name, file_url, status, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'complete', NOW())`,
      [parentId, dbChildId, documentType, documentName, file.name, storagePath]
    );
  }

  return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[upload] unhandled error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
