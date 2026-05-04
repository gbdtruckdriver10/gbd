import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, currentPassword, newPassword } = await req.json();

  if (!email || !currentPassword || !newPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  }

  const result = await pool.query(
    `SELECT user_id, password_hash FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );

  if (result.rows.length === 0 || result.rows[0].password_hash !== currentPassword) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  await pool.query(
    `UPDATE users SET password_hash = $1 WHERE user_id = $2`,
    [newPassword, result.rows[0].user_id]
  );

  return NextResponse.json({ success: true });
}
