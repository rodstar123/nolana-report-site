"use client";

import { useEffect, useRef } from "react";

const PUBLISHER_JS = "https://news.google.com/swg/js/v1/publisher.js";

/**
 * In-flight execution of publisher.js, so two buttons entering the viewport
 * together share one injection instead of racing.
 */
let running: Promise<void> | null = null;

/**
 * Execute Google's publisher.js.
 *
 * A FRESH <script> element every time, deliberately. The library self-starts:
 * on execution it calls its own `init()`, which scans for
 * `[google-add-preferred-source-btn]:not([data-initialized])` and upgrades what
 * it finds at that instant. It runs that scan ONCE and exposes no global to
 * re-run it — the module body ends with `t.preferredSource = …` where `t` is a
 * throwaway object, so nothing reaches `window`. A button mounted later by a
 * client-side navigation therefore cannot be picked up by the copy already on
 * the page; re-executing is the only way to initialize it. The file is in the
 * HTTP cache by then, so a repeat execution costs no network.
 */
function runPublisherJs(): Promise<void> {
  if (running) return running;
  running = new Promise<void>((resolve) => {
    const el = document.createElement("script");
    el.src = PUBLISHER_JS;
    el.async = true;
    const done = () => {
      running = null;
      resolve();
    };
    el.onload = done;
    el.onerror = done; // a blocked or failed load must not wedge later buttons
    document.head.appendChild(el);
  });
  return running;
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
      void runPublisherJs();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (node.hasAttribute("data-initialized")) return;
        void runPublisherJs();
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
