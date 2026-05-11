import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { show_on_website, bio, job_title, profile_image, facebook_url, linkedin_url, twitter_url, display_order } = await req.json();
  await pool.query(
    `UPDATE users SET
       show_on_website = COALESCE($1, show_on_website),
       bio = COALESCE($2, bio),
       job_title = COALESCE($3, job_title),
       profile_image = COALESCE($4, profile_image),
       facebook_url = COALESCE($5, facebook_url),
       linkedin_url = COALESCE($6, linkedin_url),
       twitter_url = COALESCE($7, twitter_url),
       display_order = COALESCE($8, display_order)
     WHERE user_id = $9`,
    [
      show_on_website ?? null,
      bio ?? null,
      job_title ?? null,
      profile_image ?? null,
      facebook_url ?? null,
      linkedin_url ?? null,
      twitter_url ?? null,
      display_order ?? null,
      id,
    ]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await pool.query(`DELETE FROM users WHERE user_id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
