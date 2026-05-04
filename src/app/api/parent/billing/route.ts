import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId");

  if (!parentId) {
    return NextResponse.json({ error: "parentId is required" }, { status: 400 });
  }

  try {
    const result = await pool.query(`
      SELECT
        i.invoice_id,
        i.invoice_number,
        i.description,
        i.amount,
        i.amount_paid,
        i.amount - i.amount_paid AS balance,
        i.due_date,
        i.status,
        i.issued_at,
        c.first_name || ' ' || c.last_name AS child_name
      FROM invoices i
      JOIN children c ON c.child_id = i.child_id
      WHERE i.parent_user_id = $1
      ORDER BY i.issued_at DESC
    `, [parentId]);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Parent billing error:", err);
    return NextResponse.json({ error: "Failed to load billing" }, { status: 500 });
  }
}
