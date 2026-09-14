/**
 * Telegram sender for the social-post generator.
 *
 * Deliberately NOT lib/agents/alerter.ts. That helper is imported by thirteen
 * handlers and has three properties this route cannot live with:
 *
 *  1. It never checks res.ok — a Telegram 400/403/429 is invisible to logs and
 *     to the database. That is the exact blindness recorded in the 2026-09-12
 *     supervisor investigation, where "cron never fired" and "cron fired,
 *     Telegram POST failed" were indistinguishable after the fact.
 *  2. It cannot split. The six-post message runs well past Telegram's 4096-char
 *     ceiling, and an over-length sendMessage is rejected outright — the whole
 *     run would look successful and deliver nothing.
 *  3. It sends parse_mode HTML with unescaped input. Post copy legitimately
 *     contains & and quotes, and one stray < would reject the message.
 *
 * Changing alerter.ts to fix these would put thirteen unrelated handlers at
 * risk for one new feature, so this is a separate module by Noe's ruling.
 */

/** Telegram's hard ceiling is 4096. 3900 leaves room for the part header. */
export const SPLIT_LIMIT = 3900;

export interface TelegramSendResult {
  ok: boolean;
  /** HTTP status of the LAST request made. 0 if none was attempted. */
  status: number;
  /** Number of messages the text was split into and sent. */
  parts: number;
}

/**
 * Escape the five characters that matter to Telegram's HTML parser.
 *
 * Telegram only requires &, < and > but escaping quotes too keeps the output
 * safe if a caller ever moves text into an attribute (href in a link line).
 * Ampersand must be replaced first or it re-escapes the entities it produces.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Split at the nearest section boundary at or under `limit`.
 *
 * Preference order matters. The message is a stack of "— PLATFORM (LANG) —"
 * blocks, so breaking on a section header keeps every post whole and readable
 * in the Telegram client. Falling back through blank line → newline → hard cut
 * means a single pathological post can still be delivered rather than throwing.
 */
export function splitMessage(text: string, limit = SPLIT_LIMIT): string[] {
  if (text.length <= limit) return [text];

  const parts: string[] = [];
  let rest = text;

  while (rest.length > limit) {
    const window = rest.slice(0, limit);

    // Never break at index 0 — that would make no progress and loop forever.
    const candidates = [
      window.lastIndexOf("\n— "),
      window.lastIndexOf("\n\n"),
      window.lastIndexOf("\n"),
    ].filter((i) => i > 0);

    const cut = candidates.length > 0 ? candidates[0] : limit;
    parts.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }

  if (rest.length > 0) parts.push(rest);
  return parts;
}

async function postMessage(
  token: string,
  chatId: string,
  text: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  const body = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, body };
}

/**
 * Send to Noe's DM (NOE_TELEGRAM_CHAT_ID — the bot chat, never the public
 * channel). Splits, sends the parts in order, and THROWS on the first non-ok
 * response so the route fails visibly instead of reporting a delivery that
 * never happened.
 */
export async function sendSocialTelegram(
  text: string,
): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_NOLANA_BOT_TOKEN;
  const chatId = process.env.NOE_TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error(
      "Telegram not configured: TELEGRAM_NOLANA_BOT_TOKEN or NOE_TELEGRAM_CHAT_ID is unset",
    );
  }

  const chunks = splitMessage(text);
  let status = 0;

  for (let i = 0; i < chunks.length; i++) {
    const header =
      chunks.length > 1 ? `<i>(${i + 1}/${chunks.length})</i>\n` : "";
    const result = await postMessage(token, chatId, header + chunks[i]);
    status = result.status;

    if (!result.ok) {
      console.error(
        `[social/telegram] part ${i + 1}/${chunks.length} failed: ` +
          `HTTP ${result.status} :: ${result.body.slice(0, 300)}`,
      );
      throw new Error(
        `Telegram send failed on part ${i + 1}/${chunks.length}: HTTP ${result.status} ${result.body.slice(0, 200)}`,
      );
    }
  }

  return { ok: true, status, parts: chunks.length };
}

/**
 * Non-throwing variant, for the failure path only.
 *
 * The route's catch block sends a one-line error and then rethrows the ORIGINAL
 * error. If the notification threw on its own, it would replace the real cause
 * with a Telegram error and the actual failure would be lost.
 */
export async function trySendSocialTelegram(
  text: string,
): Promise<TelegramSendResult> {
  try {
    return await sendSocialTelegram(text);
  } catch (err) {
    console.error(
      "[social/telegram] error notification failed:",
      err instanceof Error ? err.message : String(err),
    );
    return { ok: false, status: 0, parts: 0 };
  }
}
