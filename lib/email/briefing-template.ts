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
}

const sectionLabels: Record<string, string> = {
  new_business_pulse: "New Business Pulse",
  gov_economic_watch: "Opportunity Radar",
  cross_border_trade: "Cross-Border &amp; Trade",
  community_buzz: "Community Buzz",
  industrial_investment: "Industrial &amp; Investment Watch",
};

export function buildBriefingEmail(
  issueTitle: string,
  issueSlug: string,
  stories: Story[],
  tier: "free" | "pro" | "intel",
  opening?: string | null,
) {
  const visibleStories =
    tier === "free" ? stories.filter((s) => s.is_free) : stories;

  const grouped: Record<string, Story[]> = {};
  for (const story of visibleStories) {
    if (!grouped[story.section]) grouped[story.section] = [];
    grouped[story.section].push(story);
  }

  let html = `
    <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a;">
      <div style="text-align:center;padding:24px 0;border-bottom:2px solid #1a1a1a;">
        <h1 style="margin:0;font-size:24px;">The Nolana Report</h1>
        <p style="margin:4px 0 0;color:#666;font-size:14px;font-family:sans-serif;">
          RGV Business Intelligence — ${issueTitle}
        </p>
      </div>
  `;

  if (opening) {
    const paras = opening.split("\n\n").filter(Boolean);
    const parasHtml = paras
      .map(
        (p, i) =>
          `<p style="margin:0${i < paras.length - 1 ? " 0 14px" : ""};font-size:17px;line-height:1.7;color:#1a1a1a;font-family:Georgia,serif;">${p.trim()}</p>`,
      )
      .join("");
    html += `
      <div style="margin:28px 0 24px;padding:0 0 24px;border-bottom:1px solid #e5e0d8;">
        ${parasHtml}
      </div>
    `;
  }

  for (const [section, sectionStories] of Object.entries(grouped)) {
    html += `
      <div style="margin-top:28px;">
        <h2 style="font-size:13px;color:#0d7377;margin:0 0 14px;text-transform:uppercase;letter-spacing:1.5px;font-family:sans-serif;font-weight:700;">
          ${sectionLabels[section] ?? section}
        </h2>
    `;

    for (const story of sectionStories) {
      html += `
        <div style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #eee;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px;">
            <h3 style="margin:0;font-size:18px;line-height:1.3;flex:1;">${story.headline}</h3>
            ${story.nolana_score ? `<span style="background:#fef3c7;color:#92400e;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:bold;font-family:monospace;white-space:nowrap;flex-shrink:0;">NRI ${story.nolana_score}/10</span>` : ""}
          </div>
          <p style="margin:0 0 10px;color:#333;font-size:15px;line-height:1.6;">
            ${story.summary}
          </p>
          ${
            story.why_it_matters
              ? `<p style="margin:0 0 10px;padding:10px 14px;background:#f0fdf4;border-left:3px solid #16a34a;color:#166534;font-size:14px;line-height:1.5;">
              <strong>Why it matters:</strong> ${story.why_it_matters}
            </p>`
              : ""
          }
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-top:4px;">
            ${
              story.source_name
                ? `<p style="margin:0;font-size:12px;color:#999;font-family:sans-serif;">
                Source: ${story.source_url ? `<a href="${story.source_url}" style="color:#0d7377;">${story.source_name}</a>` : story.source_name}
                ${story.source_date ? ` · ${new Date(story.source_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
              </p>`
                : "<span></span>"
            }
            ${
              story.source_url
                ? `<a href="${story.source_url}" style="font-size:12px;font-family:sans-serif;font-weight:bold;color:#0d7377;text-decoration:none;white-space:nowrap;">Read the full story →</a>`
                : ""
            }
          </div>
        </div>
      `;
    }

    html += `</div>`;
  }

  if (tier === "free") {
    const lockedCount = stories.filter((s) => !s.is_free).length;
    html += `
      <div style="margin:32px 0;padding:28px;background:#f0f9ff;border:2px solid #bae6fd;border-radius:10px;text-align:center;font-family:sans-serif;">
        <h3 style="margin:0 0 8px;font-size:20px;color:#1a1a1a;">${lockedCount} more stories scored this week</h3>
        <p style="margin:0 0 20px;color:#555;font-size:15px;">One early signal can pay for the whole year.</p>
        <a href="https://nolanareport.com/issues/${issueSlug}"
           style="display:inline-block;background:#0d7377;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
          Read the full briefing →
        </a>
        <p style="margin:12px 0 0;font-size:12px;color:#999;">Founding members lock in $7/mo forever.</p>
      </div>
    `;
  }

  html += `
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#999;font-size:12px;font-family:sans-serif;">
      <p style="margin:0;">The Nolana Report — RGV Business Intelligence</p>
      <p style="margin:4px 0 0;">Published by National Bookkeeping Company® · McAllen, TX</p>
      <p style="margin:10px 0 0;">
        <a href="https://nolanareport.com/issues/${issueSlug}" style="color:#0d7377;">View on web</a> ·
        <a href="https://nolanareport.com/account" style="color:#0d7377;">Manage subscription</a>
      </p>
    </div>
  </div>
  `;

  return html;
}
