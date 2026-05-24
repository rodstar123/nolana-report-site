"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-navy/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-bold text-gold text-base tracking-widest uppercase"
        >
          The Nolana Report
        </Link>
        <a
          href="#pricing"
          className="font-body text-sm font-bold text-warm-white bg-teal hover:bg-teal-light px-5 py-2 rounded-lg transition-colors duration-200 min-h-[44px] flex items-center"
        >
          Subscribe
        </a>
      </div>
    </nav>
  );
}
