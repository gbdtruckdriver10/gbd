import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, body, audience, priority } = await req.json();
  await pool.query(
    `UPDATE announcements SET title = $1, body = $2, audience = $3, priority = $4 WHERE announcement_id = $5`,
    [title, body, audience, priority, id]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query(`DELETE FROM announcements WHERE announcement_id = $1`, [id]);
  return NextResponse.json({ success: true });
}
