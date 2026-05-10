import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, phone, inquiryType, message } = await req.json();

  if (!name || !email || !inquiryType || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  await pool.query(
    `INSERT INTO contact_inquiries (name, email, phone, inquiry_type, message)
     VALUES ($1, $2, $3, $4, $5)`,
    [name, email, phone || null, inquiryType, message]
  );

  const toEmail = process.env.CONTACT_EMAIL;
  if (toEmail && process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: "GBD Contact Form <onboarding@resend.dev>",
      to: toEmail,
      replyTo: email,
      subject: `New Inquiry: ${inquiryType} — ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2888B8; padding: 24px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">New Contact Inquiry</h2>
            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0;">Gifted & Beyond Daycare</p>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: 600; color: #002040;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2888B8;">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0; color: #002040;">${phone}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #6b7280;">Type</td><td style="padding: 8px 0; color: #002040; text-transform: capitalize;">${inquiryType.replace(/_/g, " ")}</td></tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="color: #6b7280; margin: 0 0 8px; font-size: 14px;">Message</p>
            <p style="color: #002040; white-space: pre-wrap; margin: 0;">${message}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
