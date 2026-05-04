import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId") ?? "1";

  const [childrenResult, enrolledResult, availableResult] = await Promise.all([
    pool.query(
      `SELECT ch.child_id, ch.first_name, ch.last_name
       FROM parent_child_relationships pcr
       JOIN children ch ON ch.child_id = pcr.child_id
       WHERE pcr.parent_user_id = $1`,
      [parentId]
    ),
    pool.query(
      `SELECT DISTINCT ON (p.program_id)
        p.program_id, p.program_name, p.description,
        p.age_min, p.age_max, p.program_type,
        ps.days_of_week, ps.start_time::text, ps.end_time::text,
        ps.price, ps.price_unit,
        u.first_name || ' ' || u.last_name AS instructor_name,
        ps.instructor_user_id,
        ch.child_id, ch.first_name AS child_first_name
       FROM program_enrollments pe
       JOIN program_sessions ps ON ps.session_id = pe.session_id
       JOIN programs p ON p.program_id = ps.program_id
       JOIN children ch ON ch.child_id = pe.child_id
       JOIN parent_child_relationships pcr ON pcr.child_id = ch.child_id
       LEFT JOIN users u ON u.user_id = ps.instructor_user_id
       WHERE pcr.parent_user_id = $1 AND pe.enrollment_status = 'active'
       ORDER BY p.program_id, ps.session_id`,
      [parentId]
    ),
    pool.query(
      `SELECT DISTINCT ON (p.program_id)
        p.program_id, p.program_name, p.description,
        p.age_min, p.age_max, p.program_type, p.is_active,
        ps.session_id, ps.days_of_week, ps.start_time::text, ps.end_time::text,
        ps.capacity, ps.price, ps.price_unit,
        u.first_name || ' ' || u.last_name AS instructor_name,
        ps.instructor_user_id,
        (SELECT COUNT(*) FROM program_enrollments pe2 WHERE pe2.session_id = ps.session_id AND pe2.enrollment_status = 'active') AS enrolled
       FROM programs p
       LEFT JOIN program_sessions ps ON ps.program_id = p.program_id AND ps.session_status = 'open'
       LEFT JOIN users u ON u.user_id = ps.instructor_user_id
       WHERE p.is_active = true
       ORDER BY p.program_id, ps.session_id`
    ),
  ]);

  const enrolledProgramIds = new Set(enrolledResult.rows.map((r) => r.program_id));

  return NextResponse.json({
    children: childrenResult.rows,
    enrolled: enrolledResult.rows,
    available: availableResult.rows.filter((p) => !enrolledProgramIds.has(p.program_id)),
  });
}
