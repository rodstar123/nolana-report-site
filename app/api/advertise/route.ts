import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";

const TO = "info@nationalboco.com";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFrom() {
  return process.env.RESEND_FROM ?? "nolana@mail.nationalboco.com";
}

function getClientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const resp = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      },
    );
    const data = await resp.json();
    return data.success === true;
  } catch {
    return true;
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit(`adv:${ip}`, 3, 3_600_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name, business, email, message, turnstileToken, website } = body;

  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!name?.trim() || !business?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "Name, business name, and email are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const turnstileOk = await verifyTurnstile(turnstileToken ?? "");
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Human verification failed." },
      { status: 403 },
    );
  }

  try {
    await getResend().emails.send({
      from: `The Nolana Report <${getFrom()}>`,
      to: TO,
      replyTo: email.trim(),
      subject: `Nolana Report Sponsorship Inquiry — ${business.trim()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="font-size: 20px; color: #1a2332; margin-bottom: 24px;">New Sponsorship Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 13px; width: 120px; vertical-align: top;">Name</td>
              <td style="padding: 8px 0; color: #2d3748; font-size: 14px;">${escapeHtml(name.trim())}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 13px; vertical-align: top;">Business</td>
              <td style="padding: 8px 0; color: #2d3748; font-size: 14px;">${escapeHtml(business.trim())}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 13px; vertical-align: top;">Email</td>
              <td style="padding: 8px 0; color: #2d3748; font-size: 14px;"><a href="mailto:${escapeHtml(email.trim())}" style="color: #0d7377;">${escapeHtml(email.trim())}</a></td>
            </tr>
            ${
              message?.trim()
                ? `<tr>
              <td style="padding: 8px 0; color: #718096; font-size: 13px; vertical-align: top;">Message</td>
              <td style="padding: 8px 0; color: #2d3748; font-size: 14px; white-space: pre-wrap;">${escapeHtml(message.trim())}</td>
            </tr>`
                : ""
            }
          </table>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #a0aec0;">Sent from nolanareport.com/advertise</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send inquiry. Please try emailing us directly." },
      { status: 500 },
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
