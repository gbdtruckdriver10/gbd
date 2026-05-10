import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await pool.query(`DELETE FROM events WHERE event_id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
