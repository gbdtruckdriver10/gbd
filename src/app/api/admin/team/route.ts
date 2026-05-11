import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    `SELECT user_id, first_name, last_name, email, role,
            COALESCE(show_on_website, false) AS show_on_website,
            bio, job_title, profile_image,
            facebook_url, linkedin_url, twitter_url,
            COALESCE(display_order, 99) AS display_order
     FROM users
     WHERE role IN ('staff', 'admin', 'cfo')
     ORDER BY COALESCE(display_order, 99), last_name, first_name`
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, role, password } = await req.json();
  if (!firstName || !lastName || !email || !role || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  const existing = await pool.query(`SELECT user_id FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, email, role, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, first_name, last_name, email, role, false AS show_on_website`,
    [firstName, lastName, email, role, password]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
