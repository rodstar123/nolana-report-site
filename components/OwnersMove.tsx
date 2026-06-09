export function OwnersMove({
  markdown,
  title = "Owner’s Move of the Week",
}: {
  markdown: string;
  title?: string;
}) {
  const body = markdown.replace(/^##\s*.+\n?/, "").trim();
  if (!body) return null;

  return (
    <div className="mb-10 p-6 bg-amber-50/70 dark:bg-amber-900/10 border-l-[3px] border-teal dark:border-teal-light rounded-r-xl">
      <h2 className="font-display font-bold text-navy dark:text-dark-text text-xl mb-3">
        {title}
      </h2>
      {body
        .split("\n\n")
        .filter(Boolean)
        .map((p: string, i: number) => (
          <p
            key={i}
            className="font-editorial text-[16px] leading-[1.75] text-charcoal dark:text-dark-text mb-3 last:mb-0"
          >
            {p.trim()}
          </p>
        ))}
    </div>
  );
}
