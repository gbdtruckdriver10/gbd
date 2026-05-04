import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const result = await pool.query(
    `SELECT user_id, first_name, last_name, email, role
     FROM users
     WHERE ($1::text IS NULL OR role = $1)
     ORDER BY first_name, last_name`,
    [role]
  );

  return NextResponse.json(result.rows);
}
