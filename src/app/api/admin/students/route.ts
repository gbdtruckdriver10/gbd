import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(`
    SELECT
      c.child_id,
      c.first_name,
      c.last_name,
      c.date_of_birth,
      c.enrollment_status,
      cl.classroom_id,
      cl.classroom_name,
      cca.assigned_from,
      u.user_id AS parent_user_id,
      u.first_name AS parent_first_name,
      u.last_name AS parent_last_name,
      u.email AS parent_email,
      u.phone AS parent_phone
    FROM children c
    LEFT JOIN child_classroom_assignments cca
      ON cca.child_id = c.child_id AND cca.status = 'active'
    LEFT JOIN classrooms cl ON cl.classroom_id = cca.classroom_id
    LEFT JOIN parent_child_relationships pcr ON pcr.child_id = c.child_id
    LEFT JOIN users u ON u.user_id = pcr.parent_user_id
    ORDER BY c.last_name, c.first_name
  `);
  return NextResponse.json(result.rows);
}
