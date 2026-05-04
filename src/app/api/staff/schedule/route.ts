import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const staffId = new URL(req.url).searchParams.get("staffId");
  if (!staffId) return NextResponse.json({ error: "staffId required" }, { status: 400 });

  const result = await pool.query(
    `SELECT schedule_id, time_label, activity, sort_order
     FROM staff_schedules
     WHERE staff_user_id = $1
     ORDER BY sort_order, schedule_id`,
    [staffId]
  );
  return NextResponse.json(result.rows);
}

export async function PUT(req: NextRequest) {
  const staffId = new URL(req.url).searchParams.get("staffId");
  if (!staffId) return NextResponse.json({ error: "staffId required" }, { status: 400 });

  const { items } = await req.json() as {
    items: { time_label: string; activity: string; sort_order: number }[];
  };

  await pool.query(`DELETE FROM staff_schedules WHERE staff_user_id = $1`, [staffId]);

  if (items.length > 0) {
    const values = items
      .map((_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`)
      .join(", ");
    const params: (string | number)[] = [staffId];
    items.forEach((item) => {
      params.push(item.time_label, item.activity, item.sort_order);
    });
    await pool.query(
      `INSERT INTO staff_schedules (staff_user_id, time_label, activity, sort_order) VALUES ${values}`,
      params
    );
  }

  return NextResponse.json({ success: true });
}
