import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "nolana@mail.nationalboco.com";

export async function sendConfirmationEmail(email: string): Promise<void> {
  await resend.emails.send({
    from: `The Nolana Report <${FROM}>`,
    to: email,
    subject: "Welcome to The Nolana Report — Lo que se mueve en el Valle",
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#f4f1ec;padding:40px;">
        <div style="background:#1a2332;padding:28px;text-align:center;border-radius:4px 4px 0 0;">
          <h1 style="color:#d4a843;font-size:22px;margin:0;letter-spacing:2px;">THE NOLANA REPORT</h1>
          <p style="color:#718096;font-size:12px;margin:6px 0 0;">Business Intelligence for the Rio Grande Valley</p>
        </div>
        <div style="background:#faf9f7;padding:32px;border-radius:0 0 4px 4px;">
          <p style="font-size:17px;color:#2d3748;line-height:1.7;margin:0 0 20px;">You're in.</p>
          <p style="font-size:15px;color:#4a5568;line-height:1.7;">Every Monday, <strong>The Nolana Report</strong> delivers the 30 stories that matter most to your business — scored, summarized, and ready to act on.</p>
          <p style="font-size:15px;color:#4a5568;line-height:1.7;margin-top:16px;">Your first briefing arrives next Monday morning.</p>
          <div style="margin-top:24px;padding:14px;background:#f0f7f7;border-radius:8px;border:1px solid #d0e8e8;text-align:center;">
            <p style="margin:0;font-size:13px;font-family:sans-serif;color:#2d3748;font-weight:bold;">Get breaking alerts on Telegram</p>
            <a href="https://t.me/NolanaReport" style="color:#0d7377;font-size:13px;font-family:sans-serif;">t.me/NolanaReport</a>
          </div>
          <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e8e3db;font-size:12px;color:#718096;text-align:center;">
            Published by <a href="https://nationalboco.com" style="color:#0d7377;">National Bookkeeping Company®</a> · McAllen, TX
          </div>
        </div>
      </div>
    `,
  });
}
