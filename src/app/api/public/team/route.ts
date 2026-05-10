import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    `SELECT user_id, first_name, last_name, role
     FROM users
     WHERE role IN ('staff', 'admin', 'cfo')
       AND show_on_website = true
     ORDER BY
       CASE role WHEN 'admin' THEN 1 WHEN 'cfo' THEN 2 ELSE 3 END,
       last_name, first_name`
  );
  return NextResponse.json(result.rows);
}
