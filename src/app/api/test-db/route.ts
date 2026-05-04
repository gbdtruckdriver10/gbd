import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query("SELECT COUNT(*) FROM users");
  return NextResponse.json({ users: result.rows[0].count });
}
