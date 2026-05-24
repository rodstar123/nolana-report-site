import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string) {
  await resend.emails.send({
    from: "The Nolana Report <briefing@nolanareport.com>",
    to: email,
    subject: "Welcome to The Nolana Report",
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a;">
        <div style="text-align:center;padding:24px 0;border-bottom:2px solid #1a1a1a;">
          <h1 style="margin:0;font-size:24px;">The Nolana Report</h1>
          <p style="margin:4px 0 0;color:#666;font-size:14px;">RGV Business Intelligence</p>
        </div>
        <div style="padding:32px 0;">
          <h2 style="margin:0 0 16px;font-size:22px;">You're on the list.</h2>
          <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
            Every Monday before 7 AM, you'll get the business openings, permits,
            government moves, trade signals, and investment stories shaping the
            Rio Grande Valley — scored, summarized, and ready to act on.
          </p>
          <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">
            Your first briefing arrives this Monday.
          </p>
          <a href="https://www.nolanareport.com/issues"
             style="display:inline-block;background:#0d7377;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:bold;font-size:15px;">
            View the Latest Briefing
          </a>
        </div>
        <div style="padding-top:24px;border-top:1px solid #eee;color:#999;font-size:12px;font-family:sans-serif;">
          <p style="margin:0;">The Nolana Report — RGV Business Intelligence</p>
          <p style="margin:4px 0 0;">Published by National Bookkeeping Company® · McAllen, TX</p>
          <p style="margin:8px 0 0;">
            <a href="https://www.nolanareport.com/account" style="color:#0d7377;">Manage subscription</a>
          </p>
        </div>
      </div>
    `,
  });
}
