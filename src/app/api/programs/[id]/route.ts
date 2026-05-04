import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await pool.query(
    `SELECT ch.child_id, ch.first_name, ch.last_name
     FROM children ch
     JOIN program_enrollments pe ON pe.child_id = ch.child_id
     JOIN program_sessions ps ON ps.session_id = pe.session_id
     WHERE ps.program_id = $1 AND pe.enrollment_status = 'active'
     ORDER BY ch.last_name, ch.first_name`,
    [id]
  );
  return NextResponse.json(result.rows);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program_name, description, age_min, age_max, is_active, session_start_date, session_end_date, instructor_user_id } = await req.json();
  await pool.query(
    `UPDATE programs SET program_name = $1, description = $2, age_min = $3, age_max = $4, is_active = $5
     WHERE program_id = $6`,
    [program_name, description, age_min, age_max, is_active, id]
  );
  await pool.query(
    `UPDATE program_sessions SET session_start_date = $1, session_end_date = $2, instructor_user_id = $3
     WHERE program_id = $4`,
    [session_start_date ?? null, session_end_date ?? null, instructor_user_id ?? null, id]
  );
  return NextResponse.json({ success: true });
}
