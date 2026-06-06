export function ThinkingQuestion({ markdown }: { markdown: string }) {
  const body = markdown.replace(/^##\s*The Thinking Question\s*\n?/, "").trim();
  if (!body) return null;

  return (
    <div className="my-12 py-10 px-8 text-center">
      <p className="font-body text-xs text-slate-light dark:text-dark-dim uppercase tracking-widest font-semibold mb-4">
        The Thinking Question
      </p>
      <p className="font-editorial text-[20px] leading-[1.6] text-navy dark:text-dark-text max-w-2xl mx-auto italic">
        {body}
      </p>
    </div>
  );
}
