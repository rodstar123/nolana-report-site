export interface Story {
  headline: string;
  summary: string;
  why_it_matters: string | null;
  source_name: string | null;
  source_url: string | null;
  source_date: string | null;
  nolana_score: number | null;
  section: string;
  is_free: boolean;
  position: number;
  money_impact: string | null;
  urgency: string | null;
  local_reach: string | null;
  risk: string | null;
  signal?: string | null;
  who_should_act?: string[] | string | null;
  smart_move?: string | null;
  nolana_take?: string | null;
}

export interface BreatherData {
  type: string;
  number?: string;
  text: string;
}

export interface BriefingEmailOptions {
  issueTitle: string;
  issueSlug: string;
  stories: Story[];
  tier: "free" | "pro" | "intel";
  opening?: string | null;
  businessTemperature?: string | null;
  valleyMoneyMap?: string | null;
  threeMoves?: string | null;
  quietSignal?: string | null;
  ownersMove?: string | null;
  riskRadar?: string | null;
  thinkingQuestion?: string | null;
  beforeYouGo?: string | null;
  breathers?: BreatherData[] | null;
  locale?: "en" | "es";
}

interface EmailChrome {
  lang: string;
  subtitle: string;
  minRead: (min: number) => string;
  storiesScored: (n: number) => string;
  businessTemperature: string;
  theMove: string;
  ownersMove: string;
  topStories: string;
  theSignal: string;
  whoShouldAct: string;
  whyItMatters: string;
  smartMove: string;
  nolanaTake: string;
  readFullStory: string;
  whyItMattersOld: string;
  alsoInThisIssue: string;
  fullBriefingCta: string;
  readingOf: (top: number, total: number) => string;
  proAlsoGet: string;
  proPerks: string;
  unlockPro: string;
  foundingNote: string;
  fullBriefingOnWeb: string;
  moreStoriesWaiting: (remaining: number, total: number) => string;
  readTheFullBriefing: string;
  riskRadar: string;
  valleyMoneyMap: string;
  threeMoves: string;
  quietSignal: string;
  thinkingQuestion: string;
  beforeYouGo: string;
  whoShouldRead: string;
  closingLine: string;
  viewOnWeb: string;
  footerPublisher: string;
  footerAddress: string;
  manageSubscription: string;
  unsubscribe: string;
  thisTimeLast: string;
  valleyVsNational: string;
  sectionLabels: Record<string, string>;
  source: string;
}

const CHROME_EN: EmailChrome = {
  lang: "en",
  subtitle: "RGV Business Intelligence",
  minRead: (min) => `~${min} min read`,
  storiesScored: (n) => `${n} stories scored`,
  businessTemperature: "This Week&#39;s Business Temperature",
  theMove: "The move:",
  ownersMove: "Owner&rsquo;s Move of the Week",
  topStories: "Top Stories This Week",
  theSignal: "\u{1F4E1} The Signal",
  whoShouldAct: "\u{1F465} Who Should Act",
  whyItMatters: "⚡ Why it matters:",
  smartMove: "\u{1F3AF} Smart Move",
  nolanaTake: "\u{1F50D} Nolana Take",
  readFullStory: "Read the full story →",
  whyItMattersOld: "Why it matters:",
  alsoInThisIssue: "Also in this issue",
  fullBriefingCta: "The Full Briefing Is Where the Moves Are",
  readingOf: (top, total) =>
    `You&rsquo;re reading ${top} of ${total} scored stories.`,
  proAlsoGet: "Pro members also get:",
  proPerks:
    "Valley Money Map &middot; 3 Moves This Week &middot; Sub-breakdowns on every story",
  unlockPro: "Unlock Pro &mdash; $7/mo",
  foundingNote:
    "Founding members lock in $7/mo forever &middot; Cancel anytime",
  fullBriefingOnWeb: "\u{1F4D6} Your full briefing is on the web",
  moreStoriesWaiting: (rem, total) =>
    `${rem} more scored stories waiting. The Valley Money Map, every sub-breakdown, and the complete ${total}-story briefing.`,
  readTheFullBriefing: "Read the full briefing →",
  riskRadar: "Risk Radar",
  valleyMoneyMap: "The Valley Money Map",
  threeMoves: "3 Moves This Week",
  quietSignal: "The Quiet Signal",
  thinkingQuestion: "The Thinking Question",
  beforeYouGo: "Before You Go",
  whoShouldRead: "Who Should Read This Issue?",
  closingLine:
    "That&rsquo;s this week&rsquo;s read. The Nolana Report publishes every Monday.",
  viewOnWeb: "View this issue on the web →",
  footerPublisher:
    "The Nolana Report is published every Monday by National Bookkeeping Company&reg;",
  footerAddress: "315 W Nolana Ave Suite G, McAllen TX 78504",
  manageSubscription: "Manage subscription",
  unsubscribe: "Unsubscribe",
  thisTimeLast: "↩ This Time Last Year",
  valleyVsNational: "\u{1F4CD} Valley vs. National",
  sectionLabels: {
    new_business_pulse: "New Business Pulse",
    gov_economic_watch: "Opportunity Radar",
    cross_border_trade: "Cross-Border &amp; Trade",
    community_buzz: "Community Buzz",
    industrial_investment: "Industrial &amp; Investment Watch",
  },
  source: "Source",
};

const CHROME_ES: EmailChrome = {
  lang: "es",
  subtitle: "Inteligencia de Negocios del RGV",
  minRead: (min) => `~${min} min de lectura`,
  storiesScored: (n) => `${n} historias evaluadas`,
  businessTemperature: "Temperatura de Negocios de la Semana",
  theMove: "La jugada:",
  ownersMove: "La Jugada de la Semana",
  topStories: "Historias Principales de la Semana",
  theSignal: "\u{1F4E1} La Señal",
  whoShouldAct: "\u{1F465} Quién Debe Actuar",
  whyItMatters: "⚡ Por qué importa:",
  smartMove: "\u{1F3AF} Jugada Inteligente",
  nolanaTake: "\u{1F50D} Opinión Nolana",
  readFullStory: "Leer historia completa →",
  whyItMattersOld: "Por qué importa:",
  alsoInThisIssue: "También en esta edición",
  fullBriefingCta: "El Reporte Completo Es Donde Están las Jugadas",
  readingOf: (top, total) =>
    `Estás leyendo ${top} de ${total} historias evaluadas.`,
  proAlsoGet: "Los miembros Pro también reciben:",
  proPerks:
    "Mapa de Dinero del Valle &middot; 3 Movimientos &middot; Sub-puntajes en cada historia",
  unlockPro: "Desbloquea Pro &mdash; $7/mes",
  foundingNote:
    "Los fundadores aseguran $7/mes para siempre &middot; Cancela cuando quieras",
  fullBriefingOnWeb: "\u{1F4D6} Tu reporte completo está en la web",
  moreStoriesWaiting: (rem, total) =>
    `${rem} historias más esperan. El Mapa de Dinero del Valle, todos los sub-puntajes, y el reporte completo de ${total} historias.`,
  readTheFullBriefing: "Leer el reporte completo →",
  riskRadar: "Radar de Riesgo",
  valleyMoneyMap: "El Mapa de Dinero del Valle",
  threeMoves: "3 Movimientos de la Semana",
  quietSignal: "La Señal Silenciosa",
  thinkingQuestion: "La Pregunta de la Semana",
  beforeYouGo: "Antes de Irte",
  whoShouldRead: "¿Quién Debe Leer Esta Edición?",
  closingLine:
    "Eso es todo por esta semana. The Nolana Report se publica cada lunes.",
  viewOnWeb: "Leer en la web →",
  footerPublisher:
    "The Nolana Report se publica cada lunes por National Bookkeeping Company&reg;",
  footerAddress: "315 W Nolana Ave Suite G, McAllen TX 78504",
  manageSubscription: "Administrar suscripción",
  unsubscribe: "Cancelar suscripción",
  thisTimeLast: "↩ El Año Pasado por Estas Fechas",
  valleyVsNational: "\u{1F4CD} Valle vs. Nacional",
  sectionLabels: {
    new_business_pulse: "Pulso de Negocios Nuevos",
    gov_economic_watch: "Radar de Oportunidades",
    cross_border_trade: "Comercio Transfronterizo",
    community_buzz: "Pulso Comunitario",
    industrial_investment: "Inversión Industrial",
  },
  source: "Fuente",
};

export function estimateReadingTime(stories: Story[]): number {
  const totalWords = stories.reduce((sum, s) => {
    const text = `${s.headline} ${s.summary} ${s.why_it_matters ?? ""}`;
    return sum + text.split(/\s+/).length;
  }, 0);
  return Math.max(3, Math.ceil(totalWords / 250));
}

export function extractTemperatureLabel(md: string): string | null {
  const match = md.match(/^##\s*This Week's Business Temperature:\s*(.+)/m);
  return match ? match[1].trim() : null;
}

function parseTemperatureForEmail(md: string) {
  const cutoff = md.search(/\n---|\n###/);
  const safe = cutoff > 0 ? md.slice(0, cutoff) : md;
  const lines = safe.split("\n");
  const label = (lines[0] || "")
    .replace(/^##\s*This Week's Business Temperature:\s*/, "")
    .trim();
  const body = lines.slice(1).join("\n").trim();
  const moveMatch = body.match(/\*\*The move:\*\*\s*(.+)/);
  return {
    label,
    content: body.replace(/\*\*The move:\*\*.+/, "").trim(),
    move: moveMatch ? moveMatch[1].trim() : null,
  };
}

function parseMoneyMapForEmail(md: string) {
  const lines = md.split("\n").filter((l) => l.trim().startsWith("|"));
  if (lines.length < 3) return null;
  const parseRow = (line: string) =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
  return { headers: parseRow(lines[0]), rows: lines.slice(2).map(parseRow) };
}

function parseMovesForEmail(md: string) {
  return md
    .split("\n")
    .filter((l) => /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());
}

function parseRisksForEmail(md: string): { text: string; who: string }[] {
  return md
    .split("\n")
    .filter(
      (l) => l.trim().startsWith("RISK:") || l.trim().startsWith("RIESGO:"),
    )
    .map((l) => {
      const content = l.replace(/^(RISK|RIESGO):\s*/, "").trim();
      const dashIdx = content.lastIndexOf(" — ");
      if (dashIdx > 0) {
        return {
          text: content.slice(0, dashIdx).trim(),
          who: content.slice(dashIdx + 3).trim(),
        };
      }
      return { text: content, who: "" };
    });
}

function getChrome(locale: "en" | "es"): EmailChrome {
  return locale === "es" ? CHROME_ES : CHROME_EN;
}

const TEAL = "#0d7377";
const NAVY = "#1a2332";
const GOLD = "#c49a30";
const CHARCOAL = "#333333";
const SLATE = "#64748b";
const WARM_WHITE = "#faf8f5";
const CREAM_BORDER = "#e5e0d8";
const PAGE_BG = "#EDE8E0";
const CARD_BG = "#FFFFFF";

function nriBadgeColors(score: number): { bg: string; color: string } {
  if (score >= 9) return { bg: "#fef2f2", color: "#dc2626" };
  if (score >= 7) return { bg: "#f0fdfa", color: TEAL };
  if (score >= 5) return { bg: "#fefce8", color: "#92400e" };
  return { bg: "#f1f5f9", color: SLATE };
}

function subScorePills(story: Story): string {
  const items: { label: string; value: string }[] = [];
  if (story.money_impact)
    items.push({ label: "Money", value: story.money_impact });
  if (story.urgency) items.push({ label: "Urgency", value: story.urgency });
  if (story.local_reach)
    items.push({ label: "Reach", value: story.local_reach });
  if (story.risk) items.push({ label: "Risk", value: story.risk });
  if (items.length === 0) return "";
  const colors: Record<string, string> = {
    High: "#C65D3A",
    Med: "#D4A843",
    Low: "#7A8B6F",
  };
  return `<tr><td colspan="2" style="padding:4px 0 0;">${items.map(({ label, value }) => `<span style="display:inline-block;background:${colors[value] || "#999"};color:#fff;border-radius:8px;padding:1px 8px;font-size:11px;font-family:'Courier New',monospace;margin-right:4px;">${label}: ${value}</span>`).join("")}</td></tr>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mdBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function buildBreatherBlock(b: BreatherData, chrome: EmailChrome): string {
  if (b.type === "stat_callout" && b.number) {
    return `<tr><td style="padding:12px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WARM_WHITE};border-radius:8px;"><tr><td style="padding:20px;text-align:center;"><p style="margin:0 0 4px;font-family:Georgia,serif;font-size:32px;font-weight:bold;color:${TEAL};">${esc(b.number)}</p><p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${CHARCOAL};">${esc(b.text)}</p></td></tr></table></td></tr>`;
  }
  if (b.type === "pull_quote") {
    return `<tr><td style="padding:12px 0;text-align:center;"><table width="80%" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:16px 0;border-top:1px solid ${CREAM_BORDER};border-bottom:1px solid ${CREAM_BORDER};"><p style="margin:0;font-family:Georgia,serif;font-size:18px;line-height:1.6;color:${CHARCOAL};font-style:italic;">${esc(b.text)}</p></td></tr></table></td></tr>`;
  }
  if (b.type === "quick_math") {
    return `<tr><td style="padding:12px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${CREAM_BORDER};border-radius:8px;"><tr><td style="padding:16px 20px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:${CHARCOAL};">\u{1F9EE} ${esc(b.text)}</td></tr></table></td></tr>`;
  }
  if (b.type === "this_time_last_year") {
    return `<tr><td style="padding:12px 0;text-align:center;"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:${SLATE};font-weight:600;">${chrome.thisTimeLast}</p><p style="margin:0;font-family:Georgia,serif;font-size:15px;line-height:1.7;color:${CHARCOAL};font-style:italic;">${esc(b.text)}</p></td></tr>`;
  }
  if (b.type === "valley_vs_national") {
    return `<tr><td style="padding:12px 0;text-align:center;"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:${SLATE};font-weight:600;">${chrome.valleyVsNational}</p><p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:${CHARCOAL};">${esc(b.text)}</p></td></tr>`;
  }
  if (b.type === "forward_this") {
    return `<tr><td style="padding:12px 0;text-align:center;"><p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:${SLATE};line-height:1.6;">\u{1F4E4} ${esc(b.text)}</p></td></tr>`;
  }
  return "";
}

function buildLockedStoryRow(story: Story): string {
  const nriHtml = story.nolana_score
    ? `<td width="80" style="padding:6px 0;font-size:14px;color:#1a6b5a;text-align:right;font-family:'Courier New',monospace;font-weight:bold;white-space:nowrap;">NRI ${story.nolana_score}/10</td>`
    : '<td width="80"></td>';
  return `<tr><td style="padding:6px 0;font-family:Georgia,serif;font-size:14px;line-height:1.4;color:#2D2D2D;border-bottom:1px solid #f0ede6;">${esc(story.headline)}</td>${nriHtml}</tr>`;
}

function buildStoryRow(story: Story, chrome: EmailChrome): string {
  const sectionLabel = chrome.sectionLabels[story.section] ?? story.section;
  const badge = story.nolana_score
    ? (() => {
        const c = nriBadgeColors(story.nolana_score);
        return `<td width="70" align="right" valign="top" style="padding-top:2px;"><span style="display:inline-block;background:${c.bg};color:${c.color};padding:3px 8px;border-radius:4px;font-size:11px;font-weight:bold;font-family:'Courier New',monospace;white-space:nowrap;">NRI ${story.nolana_score}/10</span></td>`;
      })()
    : '<td width="70"></td>';

  const scoresRow = subScorePills(story);

  const dateLang = chrome.lang === "es" ? "es-MX" : "en-US";
  const sourceHtml = story.source_name
    ? `<tr><td colspan="2" style="padding:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#999;">${chrome.source}: ${story.source_url ? `<a href="${esc(story.source_url)}" style="color:${TEAL};text-decoration:none;">${esc(story.source_name)}</a>` : esc(story.source_name)}${story.source_date ? ` &middot; ${new Date(story.source_date).toLocaleDateString(dateLang, { month: "short", day: "numeric", year: "numeric" })}` : ""}</td></tr>`
    : "";

  const readFullHtml = story.source_url
    ? `<tr><td colspan="2" style="padding:6px 0 0;"><a href="${esc(story.source_url)}" style="font-family:Arial,sans-serif;font-size:13px;color:#1a6b5a;text-decoration:none;font-weight:600;">${chrome.readFullStory}</a></td></tr>`
    : "";

  const isNewFormat = !!story.signal;

  if (isNewFormat) {
    let sections = "";

    if (story.signal) {
      sections += `<tr><td colspan="2" style="padding:14px 0 0;"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#534AB7;font-weight:700;">${chrome.theSignal}</p><p style="margin:0;font-family:Georgia,serif;font-size:16px;line-height:1.75;color:${CHARCOAL};">${mdBold(story.signal)}</p></td></tr>`;
    }

    const actorsRaw = story.who_should_act;
    const actors: string[] = Array.isArray(actorsRaw)
      ? actorsRaw
      : typeof actorsRaw === "string"
        ? actorsRaw
            .split(/[,\n]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    if (actors.length > 0) {
      const tags = actors
        .map(
          (t) =>
            `<span style="display:inline-block;background:#E8E4DC;border-radius:12px;padding:2px 10px;margin:2px 3px;font-family:Arial,sans-serif;font-size:13px;color:#2D2D2D;">${esc(t.replace(/\.$/, ""))}</span>`,
        )
        .join("");
      sections += `<tr><td colspan="2" style="padding:10px 0 0;"><p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#1D9E75;font-weight:700;">${chrome.whoShouldAct}</p><p style="margin:0;line-height:1.8;">${tags}</p></td></tr>`;
    }

    if (story.why_it_matters) {
      sections += `<tr><td colspan="2" style="padding:10px 0 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="3" style="background:${TEAL};"></td><td style="padding:10px 14px;background:#f0fdf4;font-family:Georgia,serif;font-size:14px;line-height:1.55;color:#166534;"><strong style="color:${TEAL};">${chrome.whyItMatters}</strong> ${mdBold(story.why_it_matters)}</td></tr></table></td></tr>`;
    }

    if (story.smart_move) {
      sections += `<tr><td colspan="2" style="padding:10px 0 0;"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#185FA5;font-weight:700;">${chrome.smartMove}</p><p style="margin:0;font-family:Georgia,serif;font-size:16px;line-height:1.75;color:${CHARCOAL};">${mdBold(story.smart_move)}</p></td></tr>`;
    }

    if (story.nolana_take) {
      sections += `<tr><td colspan="2" style="padding:10px 0 0;"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${SLATE};font-weight:700;">${chrome.nolanaTake}</p><p style="margin:0;font-family:Georgia,serif;font-size:16px;line-height:1.75;color:${CHARCOAL};font-style:italic;">${mdBold(story.nolana_take)}</p></td></tr>`;
    }

    return `<tr><td style="padding:0 0 24px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid #eee;padding-bottom:24px;"><tr><td style="padding:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:${TEAL};">${sectionLabel}</td>${badge}</tr><tr><td colspan="2" style="padding:0 0 6px;font-family:Georgia,serif;font-size:18px;line-height:1.35;color:${NAVY};font-weight:bold;">${esc(story.headline)}</td></tr>${scoresRow}${sections}${sourceHtml}${readFullHtml}</table></td></tr>`;
  }

  const whyItMatters = story.why_it_matters
    ? `<tr><td colspan="2" style="padding:10px 0 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="3" style="background:${TEAL};"></td><td style="padding:10px 14px;background:#f0fdf4;font-family:Georgia,serif;font-size:14px;line-height:1.55;color:#166534;"><strong style="color:${TEAL};">${chrome.whyItMattersOld}</strong> ${mdBold(story.why_it_matters)}</td></tr></table></td></tr>`
    : "";

  return `<tr><td style="padding:0 0 24px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid #eee;padding-bottom:24px;"><tr><td style="padding:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:${TEAL};">${sectionLabel}</td>${badge}</tr><tr><td colspan="2" style="padding:0 0 6px;font-family:Georgia,serif;font-size:18px;line-height:1.35;color:${NAVY};font-weight:bold;">${esc(story.headline)}</td></tr>${scoresRow}<tr><td colspan="2" style="padding:8px 0 0;font-family:Georgia,serif;font-size:16px;line-height:1.75;color:${CHARCOAL};">${mdBold(story.summary)}</td></tr>${whyItMatters}${sourceHtml}${readFullHtml}</table></td></tr>`;
}

const SECTION_AUDIENCES: Record<string, string> = {
  new_business_pulse:
    "Small business owners watching new competitors and market shifts",
  gov_economic_watch:
    "Government contractors and grant-seekers monitoring public opportunities",
  cross_border_trade:
    "Logistics operators moving goods through Brownsville and Laredo",
  community_buzz:
    "Retail and food-service operators reading local demand signals",
  industrial_investment:
    "Industrial developers and warehouse operators in the Valley",
};

function buildWhoShouldRead(stories: Story[]): string {
  const audiences = new Set<string>();
  const sections = new Set(stories.map((s) => s.section));
  sections.forEach((section) => {
    const aud = SECTION_AUDIENCES[section];
    if (aud) audiences.add(aud);
  });
  const allText = stories
    .map((s) => `${s.headline} ${s.summary} ${s.why_it_matters ?? ""}`)
    .join(" ")
    .toLowerCase();
  const kwMap: Record<string, string> = {
    produce: "Avocado brokers and haulers in the McAllen supply chain",
    port: "Port operators and maritime logistics teams in Brownsville",
    hurricane: "Facility managers and insurers preparing for hurricane season",
    childcare:
      "Child care and health facility operators ahead of new regulations",
    health: "Healthcare providers and medical practice administrators",
    construction: "General contractors and construction firms tracking permits",
    restaurant: "Restaurant owners and food-service operators watching trends",
    tech: "Tech startup founders and IT service providers in the Valley",
  };
  for (const [kw, aud] of Object.entries(kwMap)) {
    if (allText.includes(kw)) audiences.add(aud);
  }
  const items = Array.from(audiences).slice(0, 5);
  const fallbacks = [
    "Valley operators making decisions with real-time business intelligence",
    "Anyone tracking where money is moving in the Rio Grande Valley",
    "Business owners who want to know before their competitors do",
  ];
  for (const fb of fallbacks) {
    if (items.length >= 5) break;
    if (!items.includes(fb)) items.push(fb);
  }
  return items
    .map(
      (item) =>
        `<tr><td width="20" valign="top" style="padding:4px 0;"><span style="color:${TEAL};font-size:14px;font-weight:bold;">✓</span></td><td style="padding:4px 0;font-family:Arial,sans-serif;font-size:14px;color:${CHARCOAL};line-height:1.5;">${esc(item)}</td></tr>`,
    )
    .join("");
}

export function buildBriefingEmail(opts: BriefingEmailOptions): string {
  const {
    issueTitle,
    issueSlug,
    stories,
    tier,
    opening,
    businessTemperature,
    valleyMoneyMap,
    threeMoves,
    quietSignal,
    ownersMove,
    riskRadar,
    thinkingQuestion,
    beforeYouGo,
    breathers,
  } = opts;

  const locale = opts.locale ?? "en";
  const chrome = getChrome(locale);
  const canSeePro = tier === "pro" || tier === "intel";
  const CARD_LIMIT = 5;
  const topStories = stories.slice(0, CARD_LIMIT);
  const remainingStories = stories.slice(CARD_LIMIT);
  const readingTime = estimateReadingTime(stories);
  const localePrefix = locale === "es" ? "/es" : "";
  const issueUrl = `https://nolanareport.com${localePrefix}/issues/${issueSlug}`;
  const accountUrl = `https://nolanareport.com${localePrefix}/account`;

  const allBreathers = (breathers ?? []).filter((b) => b && b.type && b.text);
  const validBreathers = allBreathers.slice(0, 2);
  const breatherInterval = 2;

  let html = `<!DOCTYPE html><html lang="${chrome.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${esc(issueTitle)}</title><!-- nolana-email-v4a --><!--[if mso]><style>table{border-collapse:collapse;}td{font-family:Arial,sans-serif;}</style><![endif]--></head><body style="margin:0;padding:0;background-color:${PAGE_BG};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAGE_BG};"><tr><td align="center" style="padding:20px 12px;"><table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${CARD_BG};border-radius:8px;overflow:hidden;">`;

  // HEADER
  html += `<tr><td style="background:${NAVY};padding:28px 32px;text-align:center;"><h1 style="margin:0;font-family:Georgia,serif;font-size:26px;color:#ffffff;font-weight:bold;letter-spacing:0.5px;">The Nolana Report</h1><p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.7);">${chrome.subtitle}</p></td></tr>`;

  // DATE + READ TIME
  html += `<tr><td style="padding:20px 32px 0;text-align:center;"><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${SLATE};text-transform:uppercase;letter-spacing:1px;">${issueTitle}</p><p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:${SLATE};">${chrome.minRead(readingTime)} &middot; ${chrome.storiesScored(stories.length)}</p></td></tr>`;

  // DIVIDER
  html += `<tr><td style="padding:18px 32px 0;"><hr style="border:none;border-top:1px solid ${CREAM_BORDER};margin:0;"></td></tr>`;

  // OPENING PARAGRAPHS
  if (opening) {
    const cutoff = opening.search(/\n---|\n##/);
    const safeOpening = cutoff > 0 ? opening.slice(0, cutoff) : opening;
    const paras = safeOpening.trim().split("\n\n").filter(Boolean);
    html += `<tr><td style="padding:20px 32px 0;">${paras.map((p) => `<p style="margin:0 0 12px;font-family:Georgia,serif;font-size:17px;line-height:1.8;color:${NAVY};">${mdBold(p.trim())}</p>`).join("")}</td></tr><tr><td style="padding:8px 32px 0;"><hr style="border:none;border-top:1px solid ${CREAM_BORDER};margin:0;"></td></tr>`;
  }

  // BUSINESS TEMPERATURE
  if (businessTemperature) {
    const temp = parseTemperatureForEmail(businessTemperature);
    html += `<tr><td style="padding:24px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#f0fdfa,#fefce8);border:1px solid rgba(13,115,119,0.2);border-radius:8px;"><tr><td style="padding:20px 24px;"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:${TEAL};font-weight:700;">${chrome.businessTemperature}</p><p style="margin:0 0 12px;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:${NAVY};">${esc(temp.label)}</p>${temp.content
      .split("\n\n")
      .filter(Boolean)
      .map(
        (p) =>
          `<p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;line-height:1.75;color:${CHARCOAL};">${mdBold(p.trim())}</p>`,
      )
      .join(
        "",
      )}${temp.move ? `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:12px 0 0;border-top:1px solid rgba(13,115,119,0.2);"><p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:${TEAL};font-weight:bold;line-height:1.5;">${chrome.theMove} <span style="font-weight:normal;color:${CHARCOAL};">${mdBold(temp.move)}</span></p></td></tr></table>` : ""}</td></tr></table></td></tr>`;
  }

  // OWNER'S MOVE OF THE WEEK
  if (ownersMove) {
    const body = ownersMove.replace(/^##\s*.+\n?/, "").trim();
    if (body) {
      html += `<tr><td style="padding:24px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="4" style="background:#1a6b5a;border-radius:2px;"></td><td style="padding:18px 20px;background:${WARM_WHITE};border:1px solid ${CREAM_BORDER};border-left:none;border-radius:0 6px 6px 0;"><p style="margin:0 0 10px;font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#1a6b5a;">${chrome.ownersMove}</p>${body
        .split("\n\n")
        .filter(Boolean)
        .map(
          (p) =>
            `<p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;line-height:1.75;color:${CHARCOAL};">${mdBold(p.trim())}</p>`,
        )
        .join("")}</td></tr></table></td></tr>`;
    }
  }

  // STORY CARDS (5 max, both tiers) with breather interleaving
  html += `<tr><td style="padding:28px 32px 0;"><h2 style="margin:0 0 18px;font-family:Georgia,serif;font-size:22px;color:${NAVY};font-weight:bold;">${chrome.topStories}</h2><table width="100%" cellpadding="0" cellspacing="0" border="0">`;

  let breatherIdx = 0;
  topStories.forEach((s, i) => {
    html += buildStoryRow(s, chrome);
    if (
      (i + 1) % breatherInterval === 0 &&
      i < topStories.length - 1 &&
      breatherIdx < validBreathers.length
    ) {
      html += buildBreatherBlock(validBreathers[breatherIdx], chrome);
      breatherIdx++;
    }
  });

  html += `</table></td></tr>`;

  // TIER-SPECIFIC CTA after story cards
  if (!canSeePro && remainingStories.length > 0) {
    // FREE: paywall CTA + locked story list + web link
    html += `<tr><td style="padding:8px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${NAVY};border-radius:10px;"><tr><td style="padding:28px 24px;text-align:center;"><p style="margin:0 0 6px;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#ffffff;">${chrome.fullBriefingCta}</p><p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:14px;color:rgba(255,255,255,0.75);">${chrome.readingOf(topStories.length, stories.length)}</p><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:${GOLD};font-weight:bold;">${chrome.proAlsoGet}</p><p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;">${chrome.proPerks}</p><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://nolanareport.com/#pricing" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="17%" strokecolor="${TEAL}" fillcolor="${TEAL}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${chrome.unlockPro}</center></v:roundrect><![endif]--><!--[if !mso]><!--><a href="https://nolanareport.com/#pricing" style="display:inline-block;background:${TEAL};color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:15px;line-height:1;">${chrome.unlockPro}</a><!--<![endif]--><p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.5);">${chrome.foundingNote}</p></td></tr></table></td></tr>`;

    html += `<tr><td style="padding:20px 32px 0;"><p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${SLATE};text-transform:uppercase;letter-spacing:1px;">${chrome.alsoInThisIssue}</p><table width="100%" cellpadding="0" cellspacing="0" border="0">${remainingStories.map(buildLockedStoryRow).join("")}</table></td></tr>`;

    html += `<tr><td style="padding:20px 32px 0;text-align:center;"><a href="${issueUrl}" style="display:inline-block;background:${WARM_WHITE};border:1px solid ${CREAM_BORDER};color:${TEAL};padding:10px 24px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:13px;">${chrome.viewOnWeb}</a></td></tr>`;
  } else if (canSeePro && remainingStories.length > 0) {
    // PRO: full briefing CTA to web
    html += `<tr><td style="padding:16px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WARM_WHITE};border:1px solid ${CREAM_BORDER};border-radius:10px;"><tr><td style="padding:24px;text-align:center;"><p style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:${NAVY};">${chrome.fullBriefingOnWeb}</p><p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:14px;color:${CHARCOAL};line-height:1.6;">${chrome.moreStoriesWaiting(remainingStories.length, stories.length)}</p><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${issueUrl}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="17%" strokecolor="${TEAL}" fillcolor="${TEAL}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${chrome.readTheFullBriefing}</center></v:roundrect><![endif]--><!--[if !mso]><!--><a href="${issueUrl}" style="display:inline-block;background:${TEAL};color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:15px;line-height:1;">${chrome.readTheFullBriefing}</a><!--<![endif]--></td></tr></table></td></tr>`;
  }

  // RISK RADAR
  if (riskRadar) {
    const riskBody = riskRadar.replace(/^##\s*.+\n?/, "").trim();
    const risks = parseRisksForEmail(riskBody);
    if (risks.length > 0) {
      html += `<tr><td style="padding:28px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="4" style="background:#1a6b5a;border-radius:2px;"></td><td style="padding:18px 20px;background:${WARM_WHITE};border:1px solid ${CREAM_BORDER};border-left:none;border-radius:0 6px 6px 0;"><p style="margin:0 0 14px;font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#1a6b5a;">${chrome.riskRadar}</p><table width="100%" cellpadding="0" cellspacing="0" border="0">${risks.map((risk, i) => `<tr><td width="20" valign="top" style="padding:6px 0;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${i === 0 ? "#ef4444" : "#f59e0b"};margin-top:4px;"></span></td><td style="padding:6px 0;font-family:Georgia,serif;font-size:14px;line-height:1.6;color:${CHARCOAL};">${mdBold(risk.text)}${risk.who ? ` <span style="font-family:Arial,sans-serif;font-size:12px;color:${SLATE};"> &mdash; ${esc(risk.who)}</span>` : ""}</td></tr>`).join("")}</table></td></tr></table></td></tr>`;
    }
  }

  // VALLEY MONEY MAP (pro/intel only)
  if (canSeePro && valleyMoneyMap) {
    const mapData = parseMoneyMapForEmail(valleyMoneyMap);
    if (mapData) {
      html += `<tr><td style="padding:28px 32px 0;"><h2 style="margin:0 0 14px;font-family:Georgia,serif;font-size:20px;color:${NAVY};font-weight:bold;">${chrome.valleyMoneyMap}</h2><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${CREAM_BORDER};border-radius:6px;overflow:hidden;"><tr>${mapData.headers.map((h) => `<th style="padding:10px 12px;background:${WARM_WHITE};font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${SLATE};font-weight:700;text-align:left;border-bottom:2px solid ${CREAM_BORDER};">${esc(h)}</th>`).join("")}</tr>${mapData.rows.map((row, i) => `<tr>${row.map((cell) => `<td style="padding:8px 12px;font-family:Georgia,serif;font-size:13px;color:${CHARCOAL};border-bottom:1px solid #f0ede6;${i % 2 === 1 ? `background:${WARM_WHITE};` : ""}">${esc(cell)}</td>`).join("")}</tr>`).join("")}</table></td></tr>`;
    }
  }

  // 3 MOVES THIS WEEK (pro/intel only)
  if (canSeePro && threeMoves) {
    const moves = parseMovesForEmail(threeMoves);
    if (moves.length > 0) {
      html += `<tr><td style="padding:28px 32px 0;"><h2 style="margin:0 0 14px;font-family:Georgia,serif;font-size:20px;color:${NAVY};font-weight:bold;">${chrome.threeMoves}</h2><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WARM_WHITE};border:1px solid ${CREAM_BORDER};border-radius:6px;">${moves
        .map((move, i) => {
          const boldMatch = move.match(/^\*\*(.+?)\*\*\s*(.*)/);
          const content = boldMatch
            ? `<strong style="color:${NAVY};">${esc(boldMatch[1])}</strong> ${boldMatch[2]}`
            : move;
          return `<tr><td style="padding:14px 18px;${i < moves.length - 1 ? `border-bottom:1px solid ${CREAM_BORDER};` : ""}font-family:Georgia,serif;font-size:16px;line-height:1.75;color:${CHARCOAL};"><span style="font-family:'Courier New',monospace;font-size:14px;font-weight:bold;color:${TEAL};margin-right:8px;">${i + 1}.</span>${content}</td></tr>`;
        })
        .join("")}</table></td></tr>`;
    }
  }

  // THE QUIET SIGNAL (visible to ALL)
  if (quietSignal) {
    const cleanSignal = quietSignal.replace(/^##\s*.+\n?/, "").trim();
    if (cleanSignal) {
      html += `<tr><td style="padding:28px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="4" style="background:${GOLD};border-radius:2px;"></td><td style="padding:18px 20px;background:#fdfcf9;border:1px solid rgba(196,154,48,0.2);border-left:none;border-radius:0 6px 6px 0;"><p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:${GOLD};font-weight:700;">${chrome.quietSignal}</p>${cleanSignal
        .split("\n\n")
        .filter(Boolean)
        .map(
          (p) =>
            `<p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;line-height:1.75;color:${CHARCOAL};">${mdBold(p.trim())}</p>`,
        )
        .join("")}</td></tr></table></td></tr>`;
    }
  }

  // THE THINKING QUESTION
  if (thinkingQuestion) {
    const tqBody = thinkingQuestion.replace(/^##\s*.+\n?/, "").trim();
    if (tqBody) {
      html += `<tr><td style="padding:28px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WARM_WHITE};border:1px solid ${CREAM_BORDER};border-radius:8px;"><tr><td style="padding:24px;text-align:center;"><p style="margin:0 0 10px;font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#1a6b5a;">${chrome.thinkingQuestion}</p><p style="margin:0;font-family:Georgia,serif;font-size:17px;line-height:1.65;color:${NAVY};font-style:italic;">${mdBold(tqBody)}</p></td></tr></table></td></tr>`;
    }
  }

  // BEFORE YOU GO
  if (beforeYouGo) {
    const bygBody = beforeYouGo.replace(/^##\s*.+\n?/, "").trim();
    if (bygBody) {
      html += `<tr><td style="padding:28px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WARM_WHITE};border:1px solid ${CREAM_BORDER};border-radius:8px;"><tr><td style="padding:24px;text-align:center;"><p style="margin:0 0 10px;font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#1a6b5a;">${chrome.beforeYouGo}</p>${bygBody
        .split("\n\n")
        .filter(Boolean)
        .map(
          (p) =>
            `<p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;line-height:1.75;color:${CHARCOAL};font-style:italic;">${mdBold(p.trim())}</p>`,
        )
        .join("")}</td></tr></table></td></tr>`;
    }
  }

  // WHO SHOULD READ THIS ISSUE?
  const whoRows = buildWhoShouldRead(stories);
  html += `<tr><td style="padding:28px 32px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WARM_WHITE};border:1px solid ${CREAM_BORDER};border-radius:8px;"><tr><td style="padding:20px 24px;"><p style="margin:0 0 12px;font-family:Georgia,serif;font-size:18px;font-weight:bold;color:${TEAL};">${chrome.whoShouldRead}</p><table width="100%" cellpadding="0" cellspacing="0" border="0">${whoRows}</table></td></tr></table></td></tr>`;

  // CLOSING + VIEW ON WEB
  html += `<tr><td style="padding:28px 32px 0;text-align:center;"><p style="margin:0 0 16px;font-family:Georgia,serif;font-size:15px;color:${SLATE};font-style:italic;">${chrome.closingLine}</p><a href="${issueUrl}" style="display:inline-block;background:${WARM_WHITE};border:1px solid ${CREAM_BORDER};color:${TEAL};padding:10px 24px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:13px;">${chrome.viewOnWeb}</a></td></tr>`;

  // FOOTER
  html += `<tr><td style="padding:28px 32px;"><hr style="border:none;border-top:1px solid ${CREAM_BORDER};margin:0 0 20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#999;line-height:1.6;"><p style="margin:0;">${chrome.footerPublisher}</p><p style="margin:4px 0 0;">${chrome.footerAddress}</p><p style="margin:12px 0 0;"><a href="${issueUrl}" style="color:${TEAL};text-decoration:none;">${chrome.viewOnWeb}</a> &nbsp;&middot;&nbsp; <a href="${accountUrl}" style="color:${TEAL};text-decoration:none;">${chrome.manageSubscription}</a> &nbsp;&middot;&nbsp; <a href="${accountUrl}" style="color:#999;text-decoration:none;">${chrome.unsubscribe}</a></p></td></tr></table></td></tr>`;

  html += `</table></td></tr></table></body></html>`;

  return html;
}
