import { Resend } from "resend";

export async function sendVerificationEmail(email: string, token: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://nolanareport.com";
  const link = `${base}/api/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  await resend.emails.send({
    from: "The Nolana Report <briefing@mail.nationalboco.com>",
    to: email,
    subject: "Your Monday RGV briefing is one click away",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 20px; color: #1a1a1a;">
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 16px 0; color: #1a1a1a;">
          Welcome to The Nolana Report
        </h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0; color: #333;">
          Every Monday morning, you'll get the only RGV business briefing that scores, ranks, and explains the stories that actually matter to the Valley.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; color: #333;">
          One click to lock in your spot:
        </p>
        <div style="text-align: center; margin: 0 0 24px 0;">
          <a href="${link}"
             style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Confirm my subscription
          </a>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #888; margin: 0;">
          You're receiving this because you signed up at nolanareport.com. If this wasn't you, just ignore this email.
        </p>
      </div>
    `,
  });
}
