"use client";
import { useEffect } from "react";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenis: any;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.2 });
      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    });

    return () => lenis?.destroy?.();
  }, []);

  return <>{children}</>;
}
