import { Resend } from "resend";

export async function sendVerificationEmail(email: string, token: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://nolanareport.com";
  const link = `${base}/api/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  await resend.emails.send({
    from: "The Nolana Report <briefing@mail.nationalboco.com>",
    to: email,
    subject: "Confirm your Nolana Report subscription",
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a;">
        <div style="text-align:center;padding:24px 0;border-bottom:2px solid #1a1a1a;">
          <h1 style="margin:0;font-size:24px;">The Nolana Report</h1>
          <p style="margin:4px 0 0;color:#666;font-size:14px;">RGV Business Intelligence</p>
        </div>
        <div style="padding:32px 0;">
          <h2 style="margin:0 0 16px;font-size:22px;">One last step.</h2>
          <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">
            Click the button below to confirm your email and start receiving
            the Valley's most actionable business briefing every Monday before 7 AM.
          </p>
          <a href="${link}"
             style="display:inline-block;background:#0d7377;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:bold;font-size:15px;">
            Confirm My Subscription
          </a>
          <p style="font-size:13px;line-height:1.6;margin:24px 0 0;color:#888;">
            If you didn't subscribe, you can safely ignore this email.
          </p>
        </div>
        <div style="padding-top:24px;border-top:1px solid #eee;color:#999;font-size:12px;font-family:sans-serif;">
          <p style="margin:0;">The Nolana Report &mdash; RGV Business Intelligence</p>
          <p style="margin:4px 0 0;">Published by National Bookkeeping Company&reg; &middot; McAllen, TX</p>
        </div>
      </div>
    `,
  });
}
