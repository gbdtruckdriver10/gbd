import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const result = await pool.query(
    `SELECT
      m.message_id,
      m.subject,
      m.body,
      m.sent_at,
      m.is_read,
      m.sender_user_id,
      m.receiver_user_id,
      s.first_name || ' ' || s.last_name AS sender_name,
      s.role AS sender_role,
      r.first_name || ' ' || r.last_name AS receiver_name,
      r.role AS receiver_role
     FROM messages m
     JOIN users s ON s.user_id = m.sender_user_id
     JOIN users r ON r.user_id = m.receiver_user_id
     WHERE m.sender_user_id = $1 OR m.receiver_user_id = $1
     ORDER BY m.sent_at DESC`,
    [userId]
  );

  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { senderId, receiverId, receiverEmail, subject, body } = await req.json();

  if (!senderId || (!receiverId && !receiverEmail) || !body?.trim()) {
    return NextResponse.json({ error: "senderId, receiverId or receiverEmail, and body are required" }, { status: 400 });
  }

  let resolvedReceiverId = receiverId;

  if (!resolvedReceiverId && receiverEmail) {
    const lookup = await pool.query(
      `SELECT user_id FROM users WHERE LOWER(email) = LOWER($1)`,
      [receiverEmail]
    );
    if (lookup.rows.length === 0) {
      return NextResponse.json({ error: "No user account found for that email. The parent may not have an account yet." }, { status: 404 });
    }
    resolvedReceiverId = lookup.rows[0].user_id;
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_user_id, receiver_user_id, subject, body, sent_at, is_read)
       VALUES ($1, $2, $3, $4, NOW(), false)
       RETURNING message_id, sent_at`,
      [senderId, resolvedReceiverId, subject?.trim() || "(no subject)", body.trim()]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Send message error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
