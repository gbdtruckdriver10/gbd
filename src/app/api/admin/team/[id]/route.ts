import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { show_on_website } = await req.json();
  await pool.query(
    `UPDATE users SET show_on_website = $1 WHERE user_id = $2`,
    [show_on_website, id]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await pool.query(`DELETE FROM users WHERE user_id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
