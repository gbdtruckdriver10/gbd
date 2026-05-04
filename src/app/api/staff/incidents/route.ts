import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const [childrenResult, incidentsResult] = await Promise.all([
    pool.query(`
      SELECT ch.child_id, ch.first_name, ch.last_name, c.classroom_name
      FROM children ch
      JOIN child_classroom_assignments cca ON cca.child_id = ch.child_id AND cca.status = 'active'
      JOIN classrooms c ON c.classroom_id = cca.classroom_id
      WHERE ch.enrollment_status = 'active'
      ORDER BY ch.last_name, ch.first_name
    `),
    pool.query(`
      SELECT
        ir.incident_id,
        ir.child_id,
        ch.first_name || ' ' || ch.last_name AS child_name,
        ir.incident_date,
        ir.incident_type,
        ir.description,
        ir.action_taken,
        ir.parent_notified,
        ir.incident_status,
        u.first_name || ' ' || u.last_name AS reported_by
      FROM incident_reports ir
      JOIN children ch ON ch.child_id = ir.child_id
      JOIN users u ON u.user_id = ir.staff_user_id
      ORDER BY ir.incident_date DESC
      LIMIT 20
    `),
  ]);

  return NextResponse.json({ children: childrenResult.rows, incidents: incidentsResult.rows });
}

export async function POST(req: NextRequest) {
  const { child_id, incident_type, description, action_taken, staff_user_id } = await req.json();

  await pool.query(
    `INSERT INTO incident_reports (child_id, staff_user_id, incident_type, description, action_taken, parent_notified, incident_status)
     VALUES ($1, $2, $3, $4, $5, true, 'open')`,
    [child_id, staff_user_id ?? 4, incident_type, description, action_taken]
  );

  const [childResult, parentsResult] = await Promise.all([
    pool.query(`SELECT first_name, last_name FROM children WHERE child_id = $1`, [child_id]),
    pool.query(`SELECT parent_user_id FROM parent_child_relationships WHERE child_id = $1`, [child_id]),
  ]);

  const child = childResult.rows[0];
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const typeLabel = (incident_type as string).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (child && parentsResult.rows.length > 0) {
    const subject = `Incident Report for ${child.first_name} ${child.last_name}: ${today}`;
    const body = `${subject}  Type: ${typeLabel} | ${description}${action_taken ? ` | Action Taken: ${action_taken}` : ""}`;

    await Promise.all(
      parentsResult.rows.map((p: { parent_user_id: number }) =>
        pool.query(
          `INSERT INTO messages (sender_user_id, receiver_user_id, subject, body, sent_at, is_read)
           VALUES ($1, $2, $3, $4, NOW(), false)`,
          [staff_user_id ?? 4, p.parent_user_id, subject, body]
        )
      )
    );
  }

  return NextResponse.json({ success: true });
}
