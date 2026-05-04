import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await pool.query(
    `SELECT file_url FROM parent_documents WHERE document_id = $1`,
    [id]
  );

  const storagePath = result.rows[0]?.file_url;
  if (!storagePath) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from("parent-uploads")
    .createSignedUrl(storagePath, 120);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
