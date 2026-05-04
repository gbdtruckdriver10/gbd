import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(`
    SELECT event_id, title, description, event_date::text, start_time::text, end_time::text, location
    FROM events
    WHERE audience IN ('public', 'parents', 'all')
    ORDER BY event_date ASC
  `);
  return NextResponse.json(result.rows);
}
