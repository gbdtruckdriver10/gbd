import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { name, email, phone, inquiryType, message } = await req.json();

  if (!name || !email || !phone || !inquiryType || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  await pool.query(
    `INSERT INTO contact_inquiries (name, email, phone, inquiry_type, message)
     VALUES ($1, $2, $3, $4, $5)`,
    [name, email, phone, inquiryType, message]
  );

  return NextResponse.json({ success: true });
}
