"use client";

import { useEffect, useRef } from "react";

const PUBLISHER_JS = "https://news.google.com/swg/js/v1/publisher.js";

interface PreferredSourceApi {
  init: (options?: Record<string, unknown>) => void;
}

/**
 * Google installs `window.PREFERRED_SOURCE` as a queue: a plain ARRAY before the
 * library arrives, which its bootstrap drains, and afterwards an OBJECT whose
 * `push()` invokes the callback immediately with the live api.
 */
type PreferredSourceQueue =
  | Array<(api: PreferredSourceApi) => void>
  | { push: (...fns: Array<(api: PreferredSourceApi) => void>) => void };

declare global {
  interface Window {
    PREFERRED_SOURCE?: PreferredSourceQueue;
  }
}

/** The script only ever needs to be fetched once per document. */
let scriptRequested = false;

/**
 * Ask Google's library to scan for (and upgrade) any button not yet initialized,
 * loading it first if this is the first button to need it.
 *
 * Re-injecting the <script> does NOT work and must not be attempted. The library
 * guards its own bootstrap: it reads `self.PREFERRED_SOURCE` and, finding the
 * object it installed on a previous execution, returns a NO-OP api without ever
 * calling `init()`. So a second copy of the file — even cache-busted, so it
 * genuinely re-downloads and re-executes — initializes nothing. Verified against
 * a live page: both a same-src re-append and a `?_=<ts>` variant left a freshly
 * added button at `data-initialized` false.
 *
 * The queue below is the supported route and is correct in both states. Before
 * load, `PREFERRED_SOURCE` is an array we append to and the bootstrap drains on
 * arrival. After load, it is an object whose `push()` runs the callback straight
 * away. Either way `init()` runs and picks up
 * `[google-add-preferred-source-btn]:not([data-initialized])` — which is what a
 * button mounted by a client-side navigation needs, since the copy already on
 * the page scanned the DOM long before that button existed.
 */
function ensurePreferredSource(): void {
  const queue: PreferredSourceQueue = (window.PREFERRED_SOURCE ??= []);
  queue.push((api) => api.init());

  if (scriptRequested) return;
  scriptRequested = true;

  const el = document.createElement("script");
  el.src = PUBLISHER_JS;
  el.async = true;
  // A blocked or failed load must not permanently wedge later buttons.
  el.onerror = () => {
    scriptRequested = false;
  };
  document.head.appendChild(el);
}

/**
 * Google "Add to Preferred Sources" button.
 *
 * Google's publisher.js attaches an OPEN SHADOW ROOT to the inner node and
 * renders the button inside it. The light DOM stays empty — so grepping page
 * HTML, or reading innerHTML, for the button label finds NOTHING even while the
 * button is visibly on screen. Check `el.shadowRoot` instead. An empty node here
 * is what a working button looks like from the outside.
 *
 * The script is fetched only when a button nears the viewport, NOT on page load.
 * Every button on this site is below the fold, so nothing is lost, and this is
 * what keeps it off the measured load: as a root-layout
 * `<Script strategy="lazyOnload">` it still executed inside Lighthouse's
 * observation window and cost the homepage 3 points of mobile performance
 * (80.5 → 77.5 median of 8, LCP +0.20s, TBT 24ms → 44ms, preview vs preview).
 * `afterInteractive` would be far worse still — it adds a head preload that
 * fetches the script at high priority against the LCP, which cost 956 Sharp 24
 * points. Loading on intersection costs a reader who never scrolls nothing at
 * all.
 *
 * No `data-lang`: the widget resolves its language as
 * `data-lang || navigator.language || documentElement.lang || "en"`, so it
 * localizes to the reader's own browser. On this border that is the better guess
 * than the page's locale — an es-MX reader on the English page still gets a
 * Spanish button, and pinning the page language is what would break that. One
 * component serves both `/` and `/es`.
 *
 * `theme` must match the surface the button sits on:
 *   "dark" — a permanently dark surface, e.g. the homepage Footer's fixed
 *            #0f1722→#0a1221 gradient, which does not follow the site theme.
 *   "auto" — a surface that flips with the colour scheme, e.g. the issue-page
 *            card (`bg-teal/[0.06]` light, `dark:bg-teal/[0.08]` dark). Google
 *            reads `prefers-color-scheme` for this. Note the site's own dark
 *            mode is class-based off a `nolana-theme` localStorage value, which
 *            the widget cannot see from inside its shadow root — so a reader who
 *            has MANUALLY toggled against their OS setting sees a button themed
 *            to the OS. Closest available fit; there is no API to push a theme
 *            change to an already-rendered button.
 */
export default function PreferredSourceButton({
  theme = "auto",
  className = "",
}: {
  theme?: "dark" | "light" | "auto";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || node.hasAttribute("data-initialized")) return;

    // Older browsers without IntersectionObserver just load it right away.
    if (typeof IntersectionObserver === "undefined") {
      ensurePreferredSource();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (node.hasAttribute("data-initialized")) return;
        ensurePreferredSource();
      },
      // Start the fetch a little before the button is actually on screen so it
      // has arrived by the time the reader gets there.
      { rootMargin: "300px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={className}>
      <div ref={ref} google-add-preferred-source-btn="" data-theme={theme} />
    </div>
  );
}
