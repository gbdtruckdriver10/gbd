import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const [statsResult, programResult] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM children WHERE enrollment_status = 'active') AS total_enrolled,
        (SELECT SUM(capacity) FROM classrooms WHERE is_active = true) AS total_capacity,
        (SELECT COUNT(*) FROM attendance WHERE attendance_date >= date_trunc('month', CURRENT_DATE)) AS days_this_month
    `),
    pool.query(`
      SELECT p.program_name, COUNT(pe.enrollment_id) AS enrolled
      FROM programs p
      LEFT JOIN program_sessions ps ON ps.program_id = p.program_id
      LEFT JOIN program_enrollments pe ON pe.session_id = ps.session_id AND pe.enrollment_status = 'active'
      GROUP BY p.program_id, p.program_name
      ORDER BY p.program_id
    `),
  ]);

  const stats = statsResult.rows[0];
  const totalEnrolled = Number(stats.total_enrolled);
  const totalCapacity = Number(stats.total_capacity);
  const capacityPercent = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return NextResponse.json({
    totalEnrolled,
    totalCapacity,
    capacityPercent,
    availableSpots: Math.max(0, totalCapacity - totalEnrolled),
    programEnrollment: programResult.rows,
  });
}
