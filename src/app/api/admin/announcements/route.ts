import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(`
    SELECT
      a.announcement_id,
      a.title,
      a.body,
      a.audience,
      a.priority,
      a.publish_date::text,
      a.is_active,
      u.first_name || ' ' || u.last_name AS author
    FROM announcements a
    JOIN users u ON u.user_id = a.created_by_user_id
    ORDER BY a.publish_date DESC
  `);
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { title, body, audience, priority } = await req.json();
  const result = await pool.query(
    `INSERT INTO announcements (title, body, audience, priority, created_by_user_id)
     VALUES ($1, $2, $3, $4, 7)
     RETURNING *`,
    [title, body, audience, priority]
  );
  return NextResponse.json(result.rows[0]);
}
