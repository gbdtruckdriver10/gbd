import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

  const [monthlyResult, agingResult] = await Promise.all([
    pool.query(
      `SELECT
        COALESCE(SUM(i.amount), 0)::numeric                AS total_billed,
        COALESCE(SUM(i.amount_paid), 0)::numeric           AS total_collected,
        COALESCE(SUM(i.amount - i.amount_paid), 0)::numeric AS total_outstanding,
        COUNT(*)::int                                       AS invoice_count,
        COUNT(*) FILTER (WHERE i.status = 'paid')::int     AS paid_count,
        COUNT(*) FILTER (WHERE i.amount - i.amount_paid > 0)::int AS unpaid_count
       FROM invoices i
       WHERE TO_CHAR(i.issued_at, 'YYYY-MM') = $1`,
      [month]
    ),
    pool.query(
      `SELECT
        i.invoice_id,
        i.invoice_number,
        i.due_date::text,
        (i.amount - i.amount_paid)::numeric       AS balance,
        (CURRENT_DATE - i.due_date::date)::int    AS days_overdue,
        u.first_name || ' ' || u.last_name        AS parent_name
       FROM invoices i
       JOIN users u ON u.user_id = i.parent_user_id
       WHERE (i.amount - i.amount_paid) > 0
       ORDER BY i.due_date ASC`
    ),
  ]);

  const summary = monthlyResult.rows[0];

  const agingRows = agingResult.rows;
  const current: typeof agingRows = [];
  const days30: typeof agingRows = [];
  const days60: typeof agingRows = [];
  const days61Plus: typeof agingRows = [];

  for (const row of agingRows) {
    const d = Number(row.days_overdue);
    if (d <= 0) current.push(row);
    else if (d <= 30) days30.push(row);
    else if (d <= 60) days60.push(row);
    else days61Plus.push(row);
  }

  return NextResponse.json({
    summary: {
      total_billed: Number(summary.total_billed),
      total_collected: Number(summary.total_collected),
      total_outstanding: Number(summary.total_outstanding),
      invoice_count: summary.invoice_count,
      paid_count: summary.paid_count,
      unpaid_count: summary.unpaid_count,
    },
    aging: { current, days30, days60, days61Plus },
  });
}
