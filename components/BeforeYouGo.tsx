export function BeforeYouGo({
  markdown,
  title = "Before You Go",
}: {
  markdown: string;
  title?: string;
}) {
  const body = markdown.replace(/^##\s*.+\n?/, "").trim();
  if (!body) return null;

  return (
    <div className="mt-12 mb-6 max-w-2xl mx-auto text-center">
      <p className="font-body text-xs text-slate-light dark:text-dark-dim uppercase tracking-widest font-semibold mb-4">
        {title}
      </p>
      {body
        .split("\n\n")
        .filter(Boolean)
        .map((p: string, i: number) => (
          <p
            key={i}
            className="font-editorial text-[16px] leading-[1.75] text-slate dark:text-dark-muted italic mb-3 last:mb-0"
          >
            {p.trim()}
          </p>
        ))}
    </div>
  );
}
