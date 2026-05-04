import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");
  if (!parentId) return NextResponse.json({ error: "parentId required" }, { status: 400 });

  const [childrenResult, announcementResult] = await Promise.all([
    pool.query(
      `SELECT
        ch.child_id,
        ch.first_name,
        ch.last_name,
        EXTRACT(YEAR FROM AGE(ch.date_of_birth))::integer AS age,
        cl.classroom_name,
        COALESCE(
          ARRAY_AGG(DISTINCT p.program_name) FILTER (WHERE p.program_name IS NOT NULL),
          '{}'
        ) AS programs,
        COALESCE(
          ARRAY_AGG(DISTINCT u.first_name || ' ' || u.last_name)
          FILTER (WHERE u.user_id IS NOT NULL),
          '{}'
        ) AS classroom_teachers
       FROM parent_child_relationships pcr
       JOIN children ch ON ch.child_id = pcr.child_id
       LEFT JOIN child_classroom_assignments cca
         ON cca.child_id = ch.child_id AND cca.status = 'active'
       LEFT JOIN classrooms cl ON cl.classroom_id = cca.classroom_id
       LEFT JOIN staff_classroom_assignments sca
         ON sca.classroom_id = cl.classroom_id AND sca.assigned_to IS NULL
       LEFT JOIN users u ON u.user_id = sca.staff_user_id
       LEFT JOIN program_enrollments pe
         ON pe.child_id = ch.child_id AND pe.enrollment_status = 'active'
       LEFT JOIN program_sessions ps ON ps.session_id = pe.session_id
       LEFT JOIN programs p ON p.program_id = ps.program_id
       WHERE pcr.parent_user_id = $1
       GROUP BY ch.child_id, ch.first_name, ch.last_name, ch.date_of_birth, cl.classroom_name
       ORDER BY ch.child_id`,
      [parentId]
    ),
    pool.query(
      `SELECT a.title, a.body, a.publish_date::text, a.priority,
              u.first_name || ' ' || u.last_name AS author
       FROM announcements a
       JOIN users u ON u.user_id = a.created_by_user_id
       WHERE a.is_active = true AND a.audience IN ('parents', 'all')
       ORDER BY a.publish_date DESC
       LIMIT 1`
    ),
  ]);

  const children = await Promise.all(
    childrenResult.rows.map(async (child) => {
      const att = await pool.query(
        `SELECT a.attendance_date::text, a.check_in_time, a.check_out_time,
                dr.meal_notes, dr.general_notes
         FROM attendance a
         LEFT JOIN daily_reports dr ON dr.attendance_id = a.attendance_id
         WHERE a.child_id = $1
         ORDER BY a.attendance_date DESC
         LIMIT 1`,
        [child.child_id]
      );
      return { ...child, recentAttendance: att.rows[0] ?? null };
    })
  );

  return NextResponse.json({
    children,
    announcement: announcementResult.rows[0] ?? null,
  });
}
