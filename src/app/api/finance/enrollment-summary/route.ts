import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Get a parent's children and their monthly program totals (for invoice generation)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");

  if (!parentId) {
    return NextResponse.json({ error: "parentId is required" }, { status: 400 });
  }

  const result = await pool.query(`
    SELECT
      c.child_id,
      c.first_name || ' ' || c.last_name AS child_name,
      COALESCE(
        STRING_AGG(p.program_name, ', ' ORDER BY p.program_name),
        'No programs'
      ) AS programs,
      COALESCE(SUM(ps.price), 0) AS monthly_total
    FROM parent_child_relationships pcr
    JOIN children c ON c.child_id = pcr.child_id
    LEFT JOIN program_enrollments pe
      ON pe.child_id = c.child_id AND pe.enrollment_status = 'active'
    LEFT JOIN program_sessions ps
      ON ps.session_id = pe.session_id
      AND (ps.session_start_date IS NULL OR CURRENT_DATE >= ps.session_start_date)
      AND (ps.session_end_date IS NULL OR CURRENT_DATE <= ps.session_end_date)
    LEFT JOIN programs p ON p.program_id = ps.program_id
    WHERE pcr.parent_user_id = $1
    GROUP BY c.child_id, c.first_name, c.last_name
    ORDER BY c.first_name
  `, [parentId]);

  return NextResponse.json(result.rows);
}
