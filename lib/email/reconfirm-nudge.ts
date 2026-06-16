import { Resend } from "resend";

// One-off re-confirmation nudge. Reuses the REAL double opt-in confirmation
// URL (/api/verify-email?token=&email=) — the same route signup uses — so the
// button sets email_verified=true when clicked. No new/parallel confirm flow.
function confirmLink(email: string, token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://nolanareport.com";
  return `${base}/api/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
}

const BTN =
  "display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;";
const WRAP =
  "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 20px; color: #1a1a1a;";
const P = "font-size: 16px; line-height: 1.6; margin: 0 0 12px 0; color: #333;";
const SMALL =
  "font-size: 13px; line-height: 1.5; color: #888; margin: 16px 0 0 0;";

function preheader(text: string): string {
  return `<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${text}</span>`;
}

export async function sendReconfirmNudge(
  email: string,
  token: string,
  language: "en" | "es",
  firstName: string | null,
): Promise<string | null> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const link = confirmLink(email, token);

  if (language === "es") {
    const greeting = firstName ? `Hola ${firstName}:` : "Hola:";
    const { data, error } = await resend.emails.send({
      from: "The Nolana Report <briefing@mail.nationalboco.com>",
      to: email,
      subject: "Te falta un clic para recibir The Nolana Report",
      html: `
        ${preheader("Tu briefing semanal de negocios del Valle ya está listo — solo confirma.")}
        <div style="${WRAP}">
          <p style="${P}">${greeting}</p>
          <p style="${P}">Te registraste para The Nolana Report — el briefing semanal de inteligencia de negocios para dueños del Valle — pero nunca recibimos tu confirmación, así que todavía no apareces en la lista.</p>
          <p style="${P}">Un solo clic lo arregla:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${link}" style="${BTN}">Confirmar mi suscripción</a>
          </div>
          <p style="${P}">En cuanto confirmes, te llega inteligencia local de negocios cada lunes por la mañana. Gratis, sin compromiso.</p>
          <p style="${SMALL}">Si no te registraste, ignora este correo — no te volvemos a escribir.<br/>— The Nolana Report<br/>National Bookkeeping Company®</p>
        </div>
      `,
    });
    if (error) throw new Error(error.message);
    return data?.id ?? null;
  }

  const greeting = `Hi ${firstName || "there"},`;
  const { data, error } = await resend.emails.send({
    from: "The Nolana Report <briefing@mail.nationalboco.com>",
    to: email,
    subject: "One click left to get The Nolana Report",
    html: `
      ${preheader("Your weekly RGV business briefing is ready — just confirm.")}
      <div style="${WRAP}">
        <p style="${P}">${greeting}</p>
        <p style="${P}">You signed up for The Nolana Report — McAllen's weekly business intelligence briefing for Rio Grande Valley owners — but we never got your confirmation, so you're not on the list yet.</p>
        <p style="${P}">One click fixes that:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${link}" style="${BTN}">Confirm my subscription</a>
        </div>
        <p style="${P}">Once you confirm, you'll get scored, local business intelligence in your inbox every Monday morning. Free, no catch.</p>
        <p style="${SMALL}">If you didn't sign up, just ignore this — you won't hear from us again.<br/>— The Nolana Report<br/>National Bookkeeping Company®</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}
