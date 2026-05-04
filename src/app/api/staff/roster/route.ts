import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const staffId = new URL(req.url).searchParams.get("staffId");
  if (!staffId) return NextResponse.json({ error: "staffId required" }, { status: 400 });

  const classroomResult = await pool.query(
    `SELECT c.classroom_id, c.classroom_name
     FROM staff_classroom_assignments sca
     JOIN classrooms c ON c.classroom_id = sca.classroom_id
     WHERE sca.staff_user_id = $1 AND sca.assigned_to IS NULL
     LIMIT 1`,
    [staffId]
  );
  const classroom = classroomResult.rows[0] ?? null;

  let label: string;
  let childrenResult;

  if (classroom) {
    label = classroom.classroom_name;
    childrenResult = await pool.query(
      `SELECT ch.child_id, ch.first_name, ch.last_name, ch.date_of_birth, ch.allergies, ch.medical_notes
       FROM children ch
       JOIN child_classroom_assignments cca ON cca.child_id = ch.child_id AND cca.status = 'active'
       WHERE cca.classroom_id = $1
       ORDER BY ch.last_name, ch.first_name`,
      [classroom.classroom_id]
    );
  } else {
    const programResult = await pool.query(
      `SELECT p.program_name, ps.session_id
       FROM program_sessions ps
       JOIN programs p ON p.program_id = ps.program_id
       WHERE ps.instructor_user_id = $1
       LIMIT 1`,
      [staffId]
    );
    const program = programResult.rows[0] ?? null;
    if (!program) return NextResponse.json({ classroom: null, children: [] });

    label = program.program_name;
    childrenResult = await pool.query(
      `SELECT ch.child_id, ch.first_name, ch.last_name, ch.date_of_birth, ch.allergies, ch.medical_notes
       FROM children ch
       JOIN program_enrollments pe ON pe.child_id = ch.child_id
       WHERE pe.session_id = $1 AND pe.enrollment_status = 'active'
       ORDER BY ch.last_name, ch.first_name`,
      [program.session_id]
    );
  }

  const childIds = childrenResult.rows.map((r) => r.child_id);

  const contactsResult = childIds.length > 0
    ? await pool.query(
        `SELECT child_id, full_name, relationship_to_child, phone, email, is_authorized_pickup
         FROM child_contacts WHERE child_id = ANY($1) ORDER BY child_id, contact_id`,
        [childIds]
      )
    : { rows: [] };

  type ContactRow = { child_id: number; full_name: string; relationship_to_child: string; phone: string; email: string; is_authorized_pickup: boolean };
  const contactsByChild = new Map<number, ContactRow[]>();
  for (const contact of contactsResult.rows as ContactRow[]) {
    if (!contactsByChild.has(contact.child_id)) contactsByChild.set(contact.child_id, []);
    contactsByChild.get(contact.child_id)!.push(contact);
  }

  const children = childrenResult.rows.map((child) => ({
    ...child,
    contacts: contactsByChild.get(child.child_id) ?? [],
  }));

  return NextResponse.json({
    classroom: { classroom_id: classroom?.classroom_id ?? null, classroom_name: label },
    children,
  });
}
