import type { AgentName, RawItem, ScoredItem } from "./types";

async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_NOLANA_BOT_TOKEN;
  const chatId = process.env.NOE_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    console.error("[alerter] Telegram send failed (best-effort)");
  }
}

export async function sendInstantAlert(
  item: RawItem,
  scored: ScoredItem,
): Promise<void> {
  const text =
    `🚨 RGV Intel — High Priority\n` +
    `${scored.category} · ${item.agent}\n\n` +
    `<b>${item.title}</b>\n\n` +
    `${scored.summary}\n\n` +
    `${item.url}`;
  await sendTelegram(text);
}

export async function sendRunAlert(
  agent: AgentName,
  sourcesFailed: number,
  sourcesAttempted: number,
  itemsIngested: number,
): Promise<void> {
  if (
    sourcesFailed / Math.max(1, sourcesAttempted) > 0.5 ||
    itemsIngested === 0
  ) {
    await sendTelegram(
      `⚠️ RGV Intel — ${agent} run unhealthy: ` +
        `${sourcesFailed}/${sourcesAttempted} sources failed, ` +
        `${itemsIngested} items ingested.`,
    );
  }
}

export async function sendTokenCapAlert(
  agent: AgentName,
  tokensUsed: number,
): Promise<void> {
  await sendTelegram(
    `⚠️ RGV Intel — daily token cap hit (${tokensUsed} tokens). ` +
      `Remaining items skipped for today. Agent: ${agent}`,
  );
}

export async function sendDbWriteAlert(
  agent: AgentName,
  table: string,
  errorMsg: string,
): Promise<void> {
  await sendTelegram(
    `🔴 RGV Intel — ${agent} Supabase write failed!\n` +
      `Table: ${table}\nError: ${errorMsg.slice(0, 300)}`,
  );
}

export async function sendSourceDegradedAlert(
  agent: AgentName,
  sourceName: string,
  consecutiveFailures: number,
): Promise<void> {
  await sendTelegram(
    `⚠️ RGV Intel — source degraded\n` +
      `${sourceName} (${agent}): ${consecutiveFailures} consecutive failures. ` +
      `Auto-skipping until it recovers.`,
  );
}
