import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

async function getSessionIdForStaff(staffId: string): Promise<number | null> {
  const result = await pool.query(
    `SELECT ps.session_id FROM program_sessions ps WHERE ps.instructor_user_id = $1 LIMIT 1`,
    [staffId]
  );
  return result.rows[0]?.session_id ?? null;
}

export async function GET(req: NextRequest) {
  const staffId = new URL(req.url).searchParams.get("staffId");
  if (!staffId) return NextResponse.json({ error: "staffId required" }, { status: 400 });

  const classroomResult = await pool.query(
    `SELECT c.classroom_id FROM staff_classroom_assignments sca
     JOIN classrooms c ON c.classroom_id = sca.classroom_id
     WHERE sca.staff_user_id = $1 AND sca.assigned_to IS NULL LIMIT 1`,
    [staffId]
  );
  const classroom = classroomResult.rows[0];

  if (classroom) {
    const result = await pool.query(
      `SELECT a.attendance_id, a.child_id, a.check_in_time, a.check_out_time,
              ch.first_name, ch.last_name
       FROM attendance a
       JOIN children ch ON ch.child_id = a.child_id
       WHERE a.classroom_id = $1 AND a.attendance_date = CURRENT_DATE
       ORDER BY a.check_in_time`,
      [classroom.classroom_id]
    );
    return NextResponse.json(result.rows);
  }

  const sessionId = await getSessionIdForStaff(staffId);
  if (!sessionId) return NextResponse.json([]);

  const result = await pool.query(
    `SELECT a.attendance_id, a.child_id, a.check_in_time, a.check_out_time,
            ch.first_name, ch.last_name
     FROM attendance a
     JOIN children ch ON ch.child_id = a.child_id
     WHERE a.child_id IN (
       SELECT pe.child_id FROM program_enrollments pe WHERE pe.session_id = $1 AND pe.enrollment_status = 'active'
     ) AND a.attendance_date = CURRENT_DATE
     ORDER BY a.check_in_time`,
    [sessionId]
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { staffId, childId, classroomId, action } = await req.json();
  if (!staffId || !childId || !action) {
    return NextResponse.json({ error: "staffId, childId, action required" }, { status: 400 });
  }

  if (action === "checkin") {
    const existing = await pool.query(
      `SELECT attendance_id FROM attendance WHERE child_id = $1 AND attendance_date = CURRENT_DATE`,
      [childId]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 409 });
    }
    const result = await pool.query(
      `INSERT INTO attendance (child_id, classroom_id, attendance_date, check_in_time, checked_in_by)
       VALUES ($1, $2, CURRENT_DATE, NOW(), $3)
       RETURNING attendance_id, check_in_time`,
      [childId, classroomId ?? null, staffId]
    );
    return NextResponse.json(result.rows[0]);
  }

  if (action === "checkout") {
    const result = await pool.query(
      `UPDATE attendance SET check_out_time = NOW(), checked_out_by = $1
       WHERE child_id = $2 AND attendance_date = CURRENT_DATE AND check_out_time IS NULL
       RETURNING attendance_id, check_out_time`,
      [staffId, childId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "No active check-in found for today" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
