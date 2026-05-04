import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await pool.query(
    `SELECT ch.child_id, ch.first_name, ch.last_name, ch.date_of_birth
     FROM children ch
     JOIN child_classroom_assignments cca ON cca.child_id = ch.child_id
     WHERE cca.classroom_id = $1 AND cca.status = 'active'
     ORDER BY ch.last_name, ch.first_name`,
    [id]
  );
  return NextResponse.json(result.rows);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { classroom_name, capacity, room_location, staff_ids } = await req.json();

  await pool.query(
    `UPDATE classrooms SET classroom_name = $1, capacity = $2, room_location = $3 WHERE classroom_id = $4`,
    [classroom_name, capacity, room_location, id]
  );

  if (Array.isArray(staff_ids)) {
    // Remove all current active assignments for this classroom
    await pool.query(
      `DELETE FROM staff_classroom_assignments WHERE classroom_id = $1 AND assigned_to IS NULL`,
      [id]
    );
    for (const staffId of staff_ids) {
      // Remove any active assignment this staff member has to a different classroom
      await pool.query(
        `DELETE FROM staff_classroom_assignments WHERE staff_user_id = $1 AND classroom_id != $2 AND assigned_to IS NULL`,
        [staffId, id]
      );
      await pool.query(
        `INSERT INTO staff_classroom_assignments (staff_user_id, classroom_id, assigned_from, is_lead)
         VALUES ($1, $2, CURRENT_DATE, false)`,
        [staffId, id]
      );
    }
  }

  return NextResponse.json({ success: true });
}
