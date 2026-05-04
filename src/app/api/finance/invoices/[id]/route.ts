import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status, amountPaid } = await req.json();

  try {
    const result = await pool.query(
      `UPDATE invoices
       SET
         status = COALESCE($1, status),
         amount_paid = COALESCE($2, amount_paid)
       WHERE invoice_id = $3
       RETURNING *`,
      [status ?? null, amountPaid ?? null, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Update invoice error:", err);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await pool.query(`DELETE FROM invoices WHERE invoice_id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete invoice error:", err);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
