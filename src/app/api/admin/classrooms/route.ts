import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(`
    SELECT
      c.classroom_id,
      c.classroom_name,
      c.age_group,
      c.capacity,
      c.room_location,
      c.is_active,
      COUNT(DISTINCT cca.child_id) FILTER (WHERE cca.status = 'active') AS enrolled,
      COALESCE(
        ARRAY_AGG(DISTINCT u.first_name || ' ' || u.last_name)
        FILTER (WHERE u.user_id IS NOT NULL),
        '{}'
      ) AS staff
    FROM classrooms c
    LEFT JOIN child_classroom_assignments cca ON cca.classroom_id = c.classroom_id
    LEFT JOIN staff_classroom_assignments sca
      ON sca.classroom_id = c.classroom_id AND sca.assigned_to IS NULL
    LEFT JOIN users u ON u.user_id = sca.staff_user_id
    WHERE c.is_active = true
    GROUP BY c.classroom_id
    ORDER BY c.classroom_id
  `);
  return NextResponse.json(result.rows);
}
