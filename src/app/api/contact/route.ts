import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import nodemailer from "nodemailer";

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

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && process.env.CONTACT_TO_EMAIL) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"GBD Contact Form" <${process.env.GMAIL_USER}>`,
        to: process.env.CONTACT_TO_EMAIL,
        replyTo: email,
        subject: `New Inquiry: ${inquiryType} — ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2888B8; padding: 24px; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0;">New Contact Inquiry</h2>
              <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0;">Gifted & Beyond Daycare</p>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
              <p><strong>Inquiry Type:</strong> ${inquiryType.replace(/_/g, " ")}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
              <p style="color: #9ca3af; font-size: 12px;">Reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Email send error:", err);
    }
  }

  return NextResponse.json({ success: true });
}
