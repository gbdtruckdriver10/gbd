import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { classroomId, startDate } = await req.json();

  if (!classroomId || !startDate) {
    return NextResponse.json({ error: "classroomId and startDate are required" }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Fetch the application
    const appResult = await client.query(
      `SELECT * FROM admissions_applications WHERE application_id = $1`,
      [id]
    );
    if (appResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    const app = appResult.rows[0];

    const email = app.applicant_email ?? null;
    const firstName = app.applicant_first_name ?? null;
    const lastName = app.applicant_last_name ?? null;
    const phone = app.applicant_phone ?? null;

    // 2. Find or create the parent user account
    let parentUserId: number | null = app.parent_user_id ?? null;

    if (!parentUserId && email) {
      const existingUser = await client.query(
        `SELECT user_id FROM users WHERE LOWER(email) = LOWER($1)`,
        [email]
      );

      if (existingUser.rows.length > 0) {
        parentUserId = existingUser.rows[0].user_id;
      } else {
        const newUser = await client.query(
          `INSERT INTO users (first_name, last_name, email, phone, role, password_hash)
           VALUES ($1, $2, $3, $4, 'parent', 'parent123')
           RETURNING user_id`,
          [firstName, lastName, email, phone]
        );
        parentUserId = newUser.rows[0].user_id;
      }
    }

    // 3. Create the child record
    const childResult = await client.query(
      `INSERT INTO children (first_name, last_name, date_of_birth, enrollment_status)
       VALUES ($1, $2, $3, 'active')
       RETURNING child_id`,
      [
        app.child_first_name,
        app.child_last_name,
        app.child_dob ?? null,
      ]
    );
    const childId = childResult.rows[0].child_id;

    // 4. Link child to parent
    if (parentUserId) {
      await client.query(
        `INSERT INTO parent_child_relationships (parent_user_id, child_id, relationship_type)
         VALUES ($1, $2, 'guardian')
         ON CONFLICT DO NOTHING`,
        [parentUserId, childId]
      );
    }

    // 5. Assign child to classroom
    await client.query(
      `INSERT INTO child_classroom_assignments (child_id, classroom_id, assigned_from, status)
       VALUES ($1, $2, $3, 'active')`,
      [childId, classroomId, startDate]
    );

    // 6. Mark application as accepted
    await client.query(
      `UPDATE admissions_applications
       SET application_status = 'accepted'
       WHERE application_id = $1`,
      [id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      ok: true,
      childId,
      parentUserId,
      message: `${app.child_first_name} ${app.child_last_name} has been enrolled and assigned to a classroom.`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Accept enrollment error:", err);
    return NextResponse.json({ error: "Enrollment failed. Please try again." }, { status: 500 });
  } finally {
    client.release();
  }
}
