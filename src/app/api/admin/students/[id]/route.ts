import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Move student to a different classroom
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    if (body.classroomId !== undefined) {
      await pool.query(
        `UPDATE child_classroom_assignments
         SET classroom_id = $1
         WHERE child_id = $2 AND status = 'active'`,
        [body.classroomId, id]
      );
    } else if (body.allergies !== undefined) {
      await pool.query(
        `UPDATE children SET allergies = $1 WHERE child_id = $2`,
        [body.allergies || null, id]
      );
    } else {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update student error:", err);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// Unenroll student
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await pool.query(
      `UPDATE child_classroom_assignments
       SET status = 'inactive'
       WHERE child_id = $1 AND status = 'active'`,
      [id]
    );
    await pool.query(
      `UPDATE children SET enrollment_status = 'inactive' WHERE child_id = $1`,
      [id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unenroll student error:", err);
    return NextResponse.json({ error: "Failed to unenroll student" }, { status: 500 });
  }
}
