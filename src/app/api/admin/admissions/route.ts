import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(`
    SELECT
      a.application_id,
      a.child_first_name,
      a.child_last_name,
      a.child_dob,
      a.program_interest,
      a.desired_start_date,
      a.tour_requested,
      a.tour_scheduled_at,
      a.application_status,
      a.submitted_at,
      a.review_notes,
      COALESCE(u.first_name, a.applicant_first_name) AS parent_first_name,
      COALESCE(u.last_name,  a.applicant_last_name)  AS parent_last_name,
      COALESCE(u.email,      a.applicant_email)       AS email,
      COALESCE(u.phone,      a.applicant_phone)       AS phone
    FROM admissions_applications a
    LEFT JOIN users u ON a.parent_user_id = u.user_id
    ORDER BY a.submitted_at DESC
  `);
  return NextResponse.json(result.rows);
}
