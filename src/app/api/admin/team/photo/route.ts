import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const storagePath = `${userId}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: storageError } = await supabaseAdmin.storage
      .from("team-photos")
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage
      .from("team-photos")
      .getPublicUrl(storagePath);

    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    await pool.query(
      `UPDATE users SET profile_image = $1 WHERE user_id = $2`,
      [publicUrl, userId]
    );

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("[team photo upload] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
