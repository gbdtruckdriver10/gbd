import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Get all programs + which ones this child is enrolled in
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [allPrograms, enrolled] = await Promise.all([
    pool.query(`
      SELECT DISTINCT ON (p.program_id)
        p.program_id,
        p.program_name,
        p.program_type,
        p.description,
        ps.session_id,
        ps.days_of_week,
        ps.start_time::text,
        ps.end_time::text,
        ps.price,
        ps.price_unit,
        ps.capacity,
        ps.session_start_date,
        ps.session_end_date,
        (SELECT COUNT(*) FROM program_enrollments pe2
         WHERE pe2.session_id = ps.session_id AND pe2.enrollment_status = 'active') AS enrolled
      FROM programs p
      LEFT JOIN program_sessions ps
        ON ps.program_id = p.program_id AND ps.session_status = 'open'
      WHERE p.is_active = true
      ORDER BY p.program_id, ps.session_id
    `),
    pool.query(
      `SELECT ps.session_id, p.program_id
       FROM program_enrollments pe
       JOIN program_sessions ps ON ps.session_id = pe.session_id
       JOIN programs p ON p.program_id = ps.program_id
       WHERE pe.child_id = $1 AND pe.enrollment_status = 'active'`,
      [id]
    ),
  ]);

  const enrolledSessionIds = new Set(enrolled.rows.map((r) => r.session_id));

  const programs = allPrograms.rows.map((p) => ({
    ...p,
    is_enrolled: enrolledSessionIds.has(p.session_id),
  }));

  return NextResponse.json(programs);
}

// Enroll child in a program session
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    await pool.query(
      `INSERT INTO program_enrollments (session_id, child_id, enrollment_status)
       VALUES ($1, $2, 'active')
       ON CONFLICT (session_id, child_id) DO UPDATE SET enrollment_status = 'active'`,
      [sessionId, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Enroll in program error:", err);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}
