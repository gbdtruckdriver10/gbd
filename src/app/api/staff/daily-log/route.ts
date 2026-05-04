import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

async function getChildIdsForStaff(staffId: string): Promise<{ childIds: number[]; sessionId: number | null }> {
  const classroomResult = await pool.query(
    `SELECT c.classroom_id FROM staff_classroom_assignments sca
     JOIN classrooms c ON c.classroom_id = sca.classroom_id
     WHERE sca.staff_user_id = $1 AND sca.assigned_to IS NULL LIMIT 1`,
    [staffId]
  );
  if (classroomResult.rows[0]) {
    const childResult = await pool.query(
      `SELECT child_id FROM child_classroom_assignments WHERE classroom_id = $1 AND status = 'active'`,
      [classroomResult.rows[0].classroom_id]
    );
    return { childIds: childResult.rows.map((r: { child_id: number }) => r.child_id), sessionId: null };
  }

  const programResult = await pool.query(
    `SELECT ps.session_id FROM program_sessions ps WHERE ps.instructor_user_id = $1 LIMIT 1`,
    [staffId]
  );
  const sessionId = programResult.rows[0]?.session_id ?? null;
  if (!sessionId) return { childIds: [], sessionId: null };

  const childResult = await pool.query(
    `SELECT child_id FROM program_enrollments WHERE session_id = $1 AND enrollment_status = 'active'`,
    [sessionId]
  );
  return { childIds: childResult.rows.map((r: { child_id: number }) => r.child_id), sessionId };
}

export async function GET(req: NextRequest) {
  const staffId = new URL(req.url).searchParams.get("staffId");
  if (!staffId) return NextResponse.json({ error: "staffId required" }, { status: 400 });

  const { childIds } = await getChildIdsForStaff(staffId);
  if (childIds.length === 0) return NextResponse.json([]);

  const result = await pool.query(
    `SELECT dr.report_id, dr.child_id, dr.meal_notes, dr.nap_notes, dr.behavior_notes, dr.general_notes,
            ch.first_name, ch.last_name
     FROM daily_reports dr
     JOIN children ch ON ch.child_id = dr.child_id
     WHERE dr.child_id = ANY($1) AND dr.report_date = CURRENT_DATE
     ORDER BY ch.last_name, ch.first_name`,
    [childIds]
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { staffId, childId, meals, napTime, diaperChanges, mood, activities, parentNotes } = await req.json();
  if (!staffId || !childId) {
    return NextResponse.json({ error: "staffId and childId required" }, { status: 400 });
  }

  const napNotes = [napTime, diaperChanges ? `Diaper/Bathroom: ${diaperChanges}` : ""].filter(Boolean).join("\n") || null;
  const generalNotes = [activities, parentNotes ? `Parent Notes: ${parentNotes}` : ""].filter(Boolean).join("\n\n") || null;

  const existing = await pool.query(
    `SELECT report_id FROM daily_reports WHERE child_id = $1 AND report_date = CURRENT_DATE`,
    [childId]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE daily_reports SET meal_notes = $1, nap_notes = $2, behavior_notes = $3, general_notes = $4, staff_user_id = $5
       WHERE child_id = $6 AND report_date = CURRENT_DATE`,
      [meals || null, napNotes, mood || null, generalNotes, staffId, childId]
    );
  } else {
    const attResult = await pool.query(
      `SELECT attendance_id FROM attendance WHERE child_id = $1 AND attendance_date = CURRENT_DATE`,
      [childId]
    );
    const attendanceId = attResult.rows[0]?.attendance_id ?? null;
    await pool.query(
      `INSERT INTO daily_reports (child_id, staff_user_id, attendance_id, report_date, meal_notes, nap_notes, behavior_notes, general_notes)
       VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7)`,
      [childId, staffId, attendanceId, meals || null, napNotes, mood || null, generalNotes]
    );
  }

  // Send daily report as a message to parent(s)
  const [childResult, parentsResult] = await Promise.all([
    pool.query(`SELECT first_name, last_name FROM children WHERE child_id = $1`, [childId]),
    pool.query(`SELECT parent_user_id FROM parent_child_relationships WHERE child_id = $1`, [childId]),
  ]);

  const child = childResult.rows[0];
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  if (child && parentsResult.rows.length > 0) {
    const parts: string[] = [];
    if (meals) parts.push(`🍽 Meals: ${meals}`);
    if (napTime) parts.push(`😴 Nap: ${napTime}`);
    if (diaperChanges) parts.push(`🚼 Diaper/Bathroom: ${diaperChanges}`);
    if (mood) parts.push(`⭐ Mood: ${mood}`);
    if (activities) parts.push(`📋 Activities: ${activities}`);
    if (parentNotes) parts.push(`Note from teacher: ${parentNotes}`);

    const subject = `Daily Report for ${child.first_name} ${child.last_name}: ${today}`;
    const body = `${subject}  ${parts.join(" | ")}`;

    await Promise.all(
      parentsResult.rows.map((p) =>
        pool.query(
          `INSERT INTO messages (sender_user_id, receiver_user_id, subject, body, sent_at, is_read)
           VALUES ($1, $2, $3, $4, NOW(), false)`,
          [staffId, p.parent_user_id, subject, body]
        )
      )
    );
  }

  return NextResponse.json({ success: true });
}
