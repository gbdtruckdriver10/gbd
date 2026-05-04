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
