import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await pool.query(
    `UPDATE messages SET is_read = true WHERE message_id = $1`,
    [id]
  );
  return NextResponse.json({ ok: true });
}
