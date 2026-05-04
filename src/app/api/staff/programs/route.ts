import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const staffId = new URL(req.url).searchParams.get("staffId");
  if (!staffId) return NextResponse.json({ error: "staffId required" }, { status: 400 });

  const sessionResult = await pool.query(
    `SELECT ps.session_id, ps.session_start_date, ps.session_end_date,
            ps.days_of_week, ps.start_time::text, ps.end_time::text,
            p.program_id, p.program_name, p.description
     FROM program_sessions ps
     JOIN programs p ON p.program_id = ps.program_id
     WHERE ps.instructor_user_id = $1`,
    [staffId]
  );

  if (sessionResult.rows.length === 0) return NextResponse.json([]);

  const programs = await Promise.all(
    sessionResult.rows.map(async (row) => {
      const childrenResult = await pool.query(
        `SELECT ch.child_id, ch.first_name, ch.last_name,
                (dr.report_id IS NOT NULL) AS has_report_today,
                dr.staff_user_id AS report_staff_id,
                u.first_name || ' ' || u.last_name AS report_staff_name
         FROM program_enrollments pe
         JOIN children ch ON ch.child_id = pe.child_id
         LEFT JOIN daily_reports dr ON dr.child_id = ch.child_id AND dr.report_date = CURRENT_DATE
         LEFT JOIN users u ON u.user_id = dr.staff_user_id
         WHERE pe.session_id = $1 AND pe.enrollment_status = 'active'
         ORDER BY ch.last_name, ch.first_name`,
        [row.session_id]
      );
      return { ...row, children: childrenResult.rows };
    })
  );

  return NextResponse.json(programs);
}
