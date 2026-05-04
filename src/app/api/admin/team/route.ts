import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    `SELECT user_id, first_name, last_name, email, role
     FROM users
     WHERE role IN ('staff', 'admin', 'cfo')
     ORDER BY
       CASE role WHEN 'admin' THEN 1 WHEN 'cfo' THEN 2 ELSE 3 END,
       last_name, first_name`
  );
  return NextResponse.json(result.rows);
}
