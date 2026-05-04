import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(`
    SELECT DISTINCT ON (p.program_id)
      p.program_id,
      p.program_name,
      p.program_type,
      p.description,
      p.age_min,
      p.age_max,
      p.is_active,
      ps.session_id,
      ps.days_of_week,
      ps.start_time::text,
      ps.end_time::text,
      ps.capacity,
      ps.price,
      ps.price_unit,
      ps.session_status,
      ps.session_start_date,
      ps.session_end_date,
      ps.instructor_user_id,
      u.first_name || ' ' || u.last_name AS instructor_name,
      (
        SELECT COUNT(*) FROM program_enrollments pe
        WHERE pe.session_id = ps.session_id AND pe.enrollment_status = 'active'
      ) AS enrolled
    FROM programs p
    LEFT JOIN program_sessions ps
      ON ps.program_id = p.program_id AND ps.session_status != 'cancelled'
    LEFT JOIN users u ON u.user_id = ps.instructor_user_id
    ORDER BY p.program_id, ps.session_id
  `);
  return NextResponse.json(result.rows);
}
