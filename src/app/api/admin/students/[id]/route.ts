import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Move student to a different classroom
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { classroomId } = await req.json();

  if (!classroomId) {
    return NextResponse.json({ error: "classroomId is required" }, { status: 400 });
  }

  try {
    await pool.query(
      `UPDATE child_classroom_assignments
       SET classroom_id = $1
       WHERE child_id = $2 AND status = 'active'`,
      [classroomId, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Move student error:", err);
    return NextResponse.json({ error: "Failed to move student" }, { status: 500 });
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
