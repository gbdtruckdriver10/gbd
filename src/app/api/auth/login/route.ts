import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const result = await pool.query(
    `SELECT user_id, first_name, last_name, email, role, password_hash
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const user = result.rows[0];

  if (user.password_hash !== password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // If a specific role was required (internal logins), enforce it
  if (role && user.role !== role) {
    return NextResponse.json(
      { error: `This account does not have ${role} access` },
      { status: 403 }
    );
  }

  return NextResponse.json({
    id: String(user.user_id),
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    role: user.role,
  });
}
