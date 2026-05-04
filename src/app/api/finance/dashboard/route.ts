import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [summary, needs, recent] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(amount), 0) AS total_billed,
          COALESCE(SUM(amount_paid), 0) AS total_collected,
          COALESCE(SUM(amount - amount_paid), 0) AS total_outstanding,
          COUNT(*) AS total_invoices,
          COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count,
          COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
          COUNT(DISTINCT parent_user_id) AS active_families
        FROM invoices
      `),
      pool.query(`
        SELECT
          i.invoice_id,
          i.invoice_number,
          i.amount,
          i.amount_paid,
          i.amount - i.amount_paid AS balance,
          i.due_date,
          i.status,
          u.first_name || ' ' || u.last_name AS parent_name,
          c.first_name || ' ' || c.last_name AS child_name
        FROM invoices i
        JOIN users u ON u.user_id = i.parent_user_id
        JOIN children c ON c.child_id = i.child_id
        WHERE i.status IN ('overdue', 'partial')
        ORDER BY i.due_date ASC
        LIMIT 5
      `),
      pool.query(`
        SELECT
          i.invoice_id,
          i.invoice_number,
          i.amount,
          i.amount_paid,
          i.amount - i.amount_paid AS balance,
          i.status,
          i.issued_at,
          u.first_name || ' ' || u.last_name AS parent_name,
          c.first_name || ' ' || c.last_name AS child_name
        FROM invoices i
        JOIN users u ON u.user_id = i.parent_user_id
        JOIN children c ON c.child_id = i.child_id
        ORDER BY i.issued_at DESC
        LIMIT 5
      `),
    ]);

    return NextResponse.json({
      summary: summary.rows[0],
      needsAttention: needs.rows,
      recentInvoices: recent.rows,
    });
  } catch (err) {
    console.error("Finance dashboard error:", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
