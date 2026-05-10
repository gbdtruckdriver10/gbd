import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await pool.query(
    `SELECT contact_id, full_name, relationship_to_child, phone, email, is_authorized_pickup
     FROM child_contacts
     WHERE child_id = $1
     ORDER BY contact_id`,
    [id]
  );
  return NextResponse.json(result.rows);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { full_name, relationship_to_child, phone, email, is_authorized_pickup } = await req.json();
  if (!full_name || !relationship_to_child) {
    return NextResponse.json({ error: "Name and relationship are required" }, { status: 400 });
  }
  const result = await pool.query(
    `INSERT INTO child_contacts (child_id, full_name, relationship_to_child, phone, email, is_authorized_pickup)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING contact_id, full_name, relationship_to_child, phone, email, is_authorized_pickup`,
    [id, full_name, relationship_to_child, phone || null, email || null, is_authorized_pickup ?? false]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { contact_id, full_name, relationship_to_child, phone, email, is_authorized_pickup } = await req.json();
  const result = await pool.query(
    `UPDATE child_contacts
     SET full_name=$1, relationship_to_child=$2, phone=$3, email=$4, is_authorized_pickup=$5
     WHERE contact_id=$6 AND child_id=$7
     RETURNING contact_id, full_name, relationship_to_child, phone, email, is_authorized_pickup`,
    [full_name, relationship_to_child, phone || null, email || null, is_authorized_pickup ?? false, contact_id, id]
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { contact_id } = await req.json();
  await pool.query(
    `DELETE FROM child_contacts WHERE contact_id=$1 AND child_id=$2`,
    [contact_id, id]
  );
  return NextResponse.json({ ok: true });
}
