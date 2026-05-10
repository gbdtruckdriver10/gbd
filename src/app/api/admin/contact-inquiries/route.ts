import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    `SELECT * FROM contact_inquiries ORDER BY inquiry_id DESC`
  );
  return NextResponse.json(result.rows);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await pool.query(`DELETE FROM contact_inquiries WHERE inquiry_id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
