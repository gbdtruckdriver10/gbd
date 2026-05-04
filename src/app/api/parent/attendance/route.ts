import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId") ?? "1";

  const result = await pool.query(
    `SELECT
      ch.child_id,
      ch.first_name,
      ch.last_name,
      a.attendance_id,
      a.attendance_date::text,
      a.check_in_time,
      a.check_out_time
    FROM parent_child_relationships pcr
    JOIN children ch ON ch.child_id = pcr.child_id
    LEFT JOIN attendance a ON a.child_id = ch.child_id
    WHERE pcr.parent_user_id = $1
    ORDER BY ch.child_id, a.attendance_date DESC`,
    [parentId]
  );

  return NextResponse.json(result.rows);
}
