import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, tourScheduledAt } = await req.json();

  try {
    if (tourScheduledAt !== undefined) {
      await pool.query(
        "UPDATE admissions_applications SET application_status = $1, tour_scheduled_at = $2 WHERE application_id = $3",
        [status, tourScheduledAt, id]
      );
    } else {
      await pool.query(
        "UPDATE admissions_applications SET application_status = $1 WHERE application_id = $2",
        [status, id]
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admissions PATCH error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
