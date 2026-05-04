import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
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
      i.parent_user_id,
      i.child_id,
      u.first_name || ' ' || u.last_name AS parent_name,
      u.email AS parent_email,
      c.first_name || ' ' || c.last_name AS child_name
    FROM invoices i
    JOIN users u ON u.user_id = i.parent_user_id
    JOIN children c ON c.child_id = i.child_id
    ORDER BY i.issued_at DESC
  `);
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { parentUserId, childId, description, amount, dueDate } = await req.json();

  if (!parentUserId || !childId || !amount || !dueDate) {
    return NextResponse.json({ error: "parentUserId, childId, amount, and dueDate are required" }, { status: 400 });
  }

  try {
    // Generate invoice number: GBD-YYYY-NNN
    const year = new Date().getFullYear();
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM invoices WHERE invoice_number LIKE $1`,
      [`GBD-${year}-%`]
    );
    const seq = String(Number(countResult.rows[0].count) + 1).padStart(3, "0");
    const invoiceNumber = `GBD-${year}-${seq}`;

    const result = await pool.query(
      `INSERT INTO invoices (parent_user_id, child_id, invoice_number, description, amount, amount_paid, due_date, status, issued_at)
       VALUES ($1, $2, $3, $4, $5, 0, $6, 'unpaid', NOW())
       RETURNING *`,
      [parentUserId, childId, invoiceNumber, description || null, amount, dueDate]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Create invoice error:", err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
