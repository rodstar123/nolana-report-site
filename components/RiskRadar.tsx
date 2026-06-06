function parseRisks(md: string): { text: string; who: string }[] {
  return md
    .split("\n")
    .filter((line) => line.trim().startsWith("RISK:"))
    .map((line) => {
      const content = line.replace(/^RISK:\s*/, "").trim();
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

export function RiskRadar({ markdown }: { markdown: string }) {
  const body = markdown.replace(/^##\s*Risk Radar\s*\n?/, "").trim();
  if (!body) return null;

  const risks = parseRisks(body);
  if (risks.length === 0) return null;

  return (
    <div className="mb-10 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl p-6">
      <h2 className="font-display font-bold text-navy dark:text-dark-text text-xl mb-4">
        Risk Radar
      </h2>
      <ul className="space-y-3">
        {risks.map((risk, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                i === 0
                  ? "bg-red-500 dark:bg-red-400"
                  : "bg-amber-500 dark:bg-amber-400"
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="font-body text-sm text-charcoal dark:text-dark-text leading-relaxed">
                {risk.text}
              </p>
              {risk.who && (
                <p className="font-body text-xs text-slate-light dark:text-dark-dim mt-0.5">
                  {risk.who}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
