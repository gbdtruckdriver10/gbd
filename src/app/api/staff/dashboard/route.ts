import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const staffId = new URL(req.url).searchParams.get("staffId");
  if (!staffId) return NextResponse.json({ error: "staffId required" }, { status: 400 });

  const classroomResult = await pool.query(
    `SELECT c.classroom_id, c.classroom_name
     FROM staff_classroom_assignments sca
     JOIN classrooms c ON c.classroom_id = sca.classroom_id
     WHERE sca.staff_user_id = $1 AND sca.assigned_to IS NULL
     LIMIT 1`,
    [staffId]
  );
  const classroom = classroomResult.rows[0] ?? null;

  if (classroom) {
    const [enrolledResult, checkedInResult, incidentsResult, allergiesResult, announcementResult] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS cnt FROM child_classroom_assignments WHERE classroom_id = $1 AND status = 'active'`, [classroom.classroom_id]),
      pool.query(`SELECT COUNT(*)::int AS cnt FROM attendance WHERE classroom_id = $1 AND attendance_date = CURRENT_DATE`, [classroom.classroom_id]),
      pool.query(`SELECT COUNT(*)::int AS cnt FROM incident_reports WHERE incident_date::date = CURRENT_DATE`),
      pool.query(
        `SELECT ch.first_name, ch.last_name, ch.allergies
         FROM children ch
         JOIN child_classroom_assignments cca ON cca.child_id = ch.child_id AND cca.status = 'active'
         WHERE cca.classroom_id = $1 AND ch.allergies IS NOT NULL AND ch.allergies <> ''`,
        [classroom.classroom_id]
      ),
      pool.query(
        `SELECT a.title, a.body, a.publish_date::text, u.first_name || ' ' || u.last_name AS author
         FROM announcements a JOIN users u ON u.user_id = a.created_by_user_id
         WHERE a.is_active = true AND a.audience IN ('staff', 'all')
         ORDER BY a.publish_date DESC LIMIT 1`
      ),
    ]);
    const enrolled = enrolledResult.rows[0].cnt;
    const checkedIn = checkedInResult.rows[0].cnt;
    return NextResponse.json({
      classroom: { classroom_id: classroom.classroom_id, classroom_name: classroom.classroom_name },
      enrolled, checkedIn, notYetArrived: Math.max(0, enrolled - checkedIn),
      incidentsToday: incidentsResult.rows[0].cnt,
      allergicChildren: allergiesResult.rows,
      announcement: announcementResult.rows[0] ?? null,
    });
  }

  // No classroom — fall back to program
  const programResult = await pool.query(
    `SELECT p.program_id, p.program_name, ps.session_id
     FROM program_sessions ps
     JOIN programs p ON p.program_id = ps.program_id
     WHERE ps.instructor_user_id = $1
     LIMIT 1`,
    [staffId]
  );
  const program = programResult.rows[0] ?? null;
  if (!program) {
    return NextResponse.json({ classroom: null, enrolled: 0, checkedIn: 0, notYetArrived: 0, incidentsToday: 0, allergicChildren: [], announcement: null });
  }

  const [enrolledResult, checkedInResult, incidentsResult, allergiesResult, announcementResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS cnt FROM program_enrollments WHERE session_id = $1 AND enrollment_status = 'active'`,
      [program.session_id]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS cnt FROM attendance a
       WHERE a.child_id IN (
         SELECT pe.child_id FROM program_enrollments pe WHERE pe.session_id = $1 AND pe.enrollment_status = 'active'
       ) AND a.attendance_date = CURRENT_DATE`,
      [program.session_id]
    ),
    pool.query(`SELECT COUNT(*)::int AS cnt FROM incident_reports WHERE incident_date::date = CURRENT_DATE`),
    pool.query(
      `SELECT ch.first_name, ch.last_name, ch.allergies
       FROM children ch
       JOIN program_enrollments pe ON pe.child_id = ch.child_id
       WHERE pe.session_id = $1 AND pe.enrollment_status = 'active' AND ch.allergies IS NOT NULL AND ch.allergies <> ''`,
      [program.session_id]
    ),
    pool.query(
      `SELECT a.title, a.body, a.publish_date::text, u.first_name || ' ' || u.last_name AS author
       FROM announcements a JOIN users u ON u.user_id = a.created_by_user_id
       WHERE a.is_active = true AND a.audience IN ('staff', 'all')
       ORDER BY a.publish_date DESC LIMIT 1`
    ),
  ]);
  const enrolled = enrolledResult.rows[0].cnt;
  const checkedIn = checkedInResult.rows[0].cnt;
  return NextResponse.json({
    classroom: { classroom_id: null, classroom_name: program.program_name },
    enrolled, checkedIn, notYetArrived: Math.max(0, enrolled - checkedIn),
    incidentsToday: incidentsResult.rows[0].cnt,
    allergicChildren: allergiesResult.rows,
    announcement: announcementResult.rows[0] ?? null,
  });
}
