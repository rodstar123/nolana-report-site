/**
 * Google "Add to Preferred Sources" button.
 *
 * Google's publisher.js (loaded once per document in app/[locale]/layout.tsx)
 * finds this node by its attribute, attaches an OPEN SHADOW ROOT to it and
 * renders the button inside that. The light DOM stays empty — so grepping page
 * HTML, or reading innerHTML, for the button label finds NOTHING even while the
 * button is visibly on screen. Check `el.shadowRoot` instead. An empty node here
 * is what a working button looks like from the outside.
 *
 * No `data-lang`: the widget resolves its language as
 * `data-lang || navigator.language || documentElement.lang || "en"`, so it
 * localizes to the reader's own browser. On this border that is the better
 * guess than the page's locale — an es-MX reader on the English page still gets
 * a Spanish button, and pinning the page language is exactly what would break
 * that. One component serves both `/` and `/es`.
 *
 * `theme` must match the surface the button sits on:
 *   "dark" — a permanently dark surface, e.g. the homepage Footer's fixed
 *            #0f1722→#0a1221 gradient, which does not follow the site theme.
 *   "auto" — a surface that flips with the colour scheme, e.g. the issue-page
 *            card (`bg-teal/[0.06]` light, `dark:bg-teal/[0.08]` dark). Google
 *            reads `prefers-color-scheme` for this. Note the site's own dark
 *            mode is class-based off a `nolana-theme` localStorage value, which
 *            the widget cannot see from inside its shadow root — so a reader who
 *            has MANUALLY toggled against their OS setting will see a button
 *            themed to the OS, not to the page. Closest available fit; there is
 *            no API to push a theme change to an already-rendered button.
 */
export default function PreferredSourceButton({
  theme = "auto",
  className = "",
}: {
  theme?: "dark" | "light" | "auto";
  className?: string;
}) {
  return (
    <div className={className}>
      <div google-add-preferred-source-btn="" data-theme={theme} />
    </div>
  );
}
