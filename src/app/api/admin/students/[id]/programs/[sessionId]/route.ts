import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Unenroll child from a program session
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  const { id, sessionId } = await params;

  try {
    await pool.query(
      `UPDATE program_enrollments
       SET enrollment_status = 'cancelled'
       WHERE session_id = $1 AND child_id = $2 AND enrollment_status = 'active'`,
      [sessionId, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unenroll from program error:", err);
    return NextResponse.json({ error: "Failed to unenroll" }, { status: 500 });
  }
}
