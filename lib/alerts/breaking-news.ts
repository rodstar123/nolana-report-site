import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export interface BreakingAlertPayload {
  title: string;
  summary: string;
  score: number;
  category: string;
  source: string;
  url: string;
  agent: string;
}

export interface BreakingAlertResult {
  channelPosted: boolean;
  emailsSent: number;
  emailFailed: boolean;
}

async function postToChannel(payload: BreakingAlertPayload): Promise<boolean> {
  const token = process.env.TELEGRAM_NOLANA_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_NOLANA_CHANNEL_ID;
  if (!token || !channelId) return false;

  const text =
    `\u{1F534} <b>RGV Business Alert</b>\n\n` +
    `<b>${payload.title}</b>\n\n` +
    `${payload.summary}\n\n` +
    `\u{1F4CA} NRI Score: ${payload.score}/100 \u{00B7} ${payload.category}\n` +
    `\u{1F4F0} Source: ${payload.source}\n\n` +
    `<a href="${payload.url}">Read Full Story \u{2192}</a>\n\n` +
    `\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\n` +
    `<i>The Nolana Report \u{2014} RGV Business Intelligence</i>\n` +
    `<a href="https://www.nolanareport.com">nolanareport.com</a>`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: channelId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      },
    );
    return res.ok;
  } catch {
    console.error("[breaking-news] Telegram channel post failed");
    return false;
  }
}

function buildAlertEmail(payload: BreakingAlertPayload): string {
  return `
<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#f4f1ec;">
  <div style="background:linear-gradient(135deg,#1a2332 0%,#2d3748 100%);padding:28px;text-align:center;">
    <p style="color:#e53e3e;font-size:12px;letter-spacing:3px;margin:0 0 8px;font-family:sans-serif;font-weight:bold;">BREAKING ALERT</p>
    <h1 style="color:#d4a843;font-size:20px;margin:0;letter-spacing:2px;">THE NOLANA REPORT</h1>
  </div>
  <div style="background:#faf9f7;padding:32px;">
    <h2 style="font-size:22px;color:#1a202c;line-height:1.3;margin:0 0 16px;">${payload.title}</h2>
    <p style="font-size:16px;color:#4a5568;line-height:1.7;margin:0 0 20px;">${payload.summary}</p>
    <div style="margin:0 0 24px;">
      <span style="display:inline-block;background:#e53e3e;color:white;padding:6px 14px;border-radius:20px;font-size:13px;font-family:sans-serif;font-weight:bold;">
        NRI Score: ${payload.score}/100
      </span>
      <span style="color:#718096;font-size:13px;font-family:sans-serif;margin-left:12px;">
        ${payload.category} &middot; ${payload.source}
      </span>
    </div>
    <a href="${payload.url}"
       style="display:inline-block;background:#0d7377;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:bold;font-size:15px;">
      Read Full Story &rarr;
    </a>
  </div>
  <div style="padding:20px 32px;background:#f0ede8;border-top:1px solid #e8e3db;text-align:center;">
    <p style="margin:0 0 8px;font-size:13px;color:#718096;font-family:sans-serif;">
      Get alerts instantly on Telegram: <a href="https://t.me/NolanaReport" style="color:#0d7377;">t.me/NolanaReport</a>
    </p>
    <p style="margin:0;font-size:12px;color:#a0aec0;font-family:sans-serif;">
      The Nolana Report &middot; Published by National Bookkeeping Company&reg; &middot; McAllen, TX
    </p>
  </div>
</div>`;
}

async function emailPaidSubscribers(
  payload: BreakingAlertPayload,
): Promise<{ sent: number; failed: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: 0, failed: false };

  const resend = new Resend(apiKey);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("email")
    .in("tier", ["pro", "intel"])
    .eq("unsubscribed", false)
    .eq("email_verified", true);

  if (!subscribers?.length) return { sent: 0, failed: false };

  const emails = subscribers.map((s: { email: string }) => s.email);
  const html = buildAlertEmail(payload);
  const from = process.env.RESEND_FROM ?? "nolana@mail.nationalboco.com";

  try {
    await resend.emails.send({
      from: `The Nolana Report <${from}>`,
      to: from,
      bcc: emails,
      subject: `Breaking: ${payload.title} — The Nolana Report`,
      html,
    });
    return { sent: emails.length, failed: false };
  } catch (err) {
    console.error("[breaking-news] Email send failed:", err);
    return { sent: 0, failed: true };
  }
}

export async function sendBreakingAlert(
  payload: BreakingAlertPayload,
): Promise<BreakingAlertResult> {
  const [channelPosted, emailResult] = await Promise.all([
    postToChannel(payload),
    emailPaidSubscribers(payload),
  ]);

  return {
    channelPosted,
    emailsSent: emailResult.sent,
    emailFailed: emailResult.failed,
  };
}
