import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const [statsResult, applicationsResult, classroomsResult] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM children WHERE enrollment_status = 'active') AS total_enrolled,
        (SELECT SUM(capacity) FROM classrooms WHERE is_active = true) AS total_capacity,
        (SELECT COUNT(*) FROM admissions_applications WHERE application_status = 'submitted') AS pending_applications,
        (SELECT COUNT(*) FROM programs WHERE is_active = true) AS active_programs
    `),
    pool.query(`
      SELECT
        a.application_id,
        a.child_first_name || ' ' || a.child_last_name AS child_name,
        COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') AS parent_name,
        a.application_status,
        a.submitted_at::text,
        a.program_interest
      FROM admissions_applications a
      LEFT JOIN users u ON u.user_id = a.parent_user_id
      ORDER BY a.submitted_at DESC
      LIMIT 3
    `),
    pool.query(`
      SELECT
        c.classroom_id,
        c.classroom_name,
        c.capacity,
        COUNT(cca.child_id) AS enrolled
      FROM classrooms c
      LEFT JOIN child_classroom_assignments cca ON cca.classroom_id = c.classroom_id AND cca.status = 'active'
      WHERE c.is_active = true
      GROUP BY c.classroom_id, c.classroom_name, c.capacity
      ORDER BY c.classroom_id
    `),
  ]);

  const stats = statsResult.rows[0];
  const totalEnrolled = Number(stats.total_enrolled);
  const totalCapacity = Number(stats.total_capacity);

  return NextResponse.json({
    totalEnrolled,
    totalCapacity,
    capacityPercent: totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0,
    pendingApplications: Number(stats.pending_applications),
    activePrograms: Number(stats.active_programs),
    recentApplications: applicationsResult.rows,
    classrooms: classroomsResult.rows,
  });
}
