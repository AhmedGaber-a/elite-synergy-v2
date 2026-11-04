// src/lib/services/mailer.ts
// Sends through Resend when RESEND_API_KEY is set (recommended), otherwise falls back to Gmail SMTP.
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const from = process.env.EMAIL_FROM || `"Elite Synergy" <${process.env.EMAIL_USER}>`;

  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    return;
  }

  await transporter.sendMail({ from, to, subject, html });
}
