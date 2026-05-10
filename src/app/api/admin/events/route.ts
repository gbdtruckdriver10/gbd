import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(`
    SELECT event_id, title, description, event_date::text, start_time::text, end_time::text, location, audience
    FROM events
    ORDER BY event_date ASC
  `);
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { title, description, event_date, start_time, end_time, location, audience, createdByUserId } = await req.json();
  if (!title || !event_date) {
    return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
  }
  const result = await pool.query(
    `INSERT INTO events (title, description, event_date, start_time, end_time, location, audience, created_by_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING event_id, title, description, event_date::text, start_time::text, end_time::text, location, audience`,
    [title, description || null, event_date, start_time || null, end_time || null, location || null, audience || "public", createdByUserId]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
