import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    parentFirstName,
    parentLastName,
    email,
    phone,
    childFirstName,
    childLastName,
    childDob,
    desiredProgram,
    desiredStartDate,
    tourCompleted,
    notes,
  } = body;

  if (!email || !childFirstName || !childLastName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `INSERT INTO admissions_applications (
        applicant_first_name,
        applicant_last_name,
        applicant_email,
        applicant_phone,
        child_first_name,
        child_last_name,
        child_dob,
        program_interest,
        desired_start_date,
        tour_requested,
        review_notes,
        application_status,
        submitted_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'submitted',NOW())
      RETURNING application_id`,
      [
        parentFirstName || null,
        parentLastName || null,
        email,
        phone || null,
        childFirstName,
        childLastName,
        childDob || null,
        desiredProgram || null,
        desiredStartDate || null,
        tourCompleted === "yes",
        notes || null,
      ]
    );

    return NextResponse.json({ application_id: result.rows[0].application_id }, { status: 201 });
  } catch (err) {
    console.error("Apply submission error:", err);
    return NextResponse.json({ error: "Failed to submit application. Please try again." }, { status: 500 });
  }
}
