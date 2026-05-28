"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
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
          className="flex items-center gap-2.5 group"
          aria-label="The Nolana Report — home"
        >
          <BrandMark
            size={18}
            className="text-gold flex-shrink-0 transition-opacity duration-200 group-hover:opacity-80"
          />
          <span className="font-display font-bold text-gold text-sm sm:text-base tracking-wide sm:tracking-widest uppercase transition-opacity duration-200 group-hover:opacity-80">
            The Nolana<span className="hidden sm:inline"> Report</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isHomepage ? (
            <a
              href="#pricing"
              className="font-body text-sm font-bold text-warm-white bg-teal hover:bg-teal-light px-5 py-2 rounded-lg transition-colors duration-200 min-h-[44px] flex items-center"
            >
              Subscribe
            </a>
          ) : isLoggedIn ? (
            <Link
              href="/account"
              className="font-body text-sm font-semibold text-teal-light hover:text-warm-white border border-teal/30 hover:border-teal/60 px-5 py-2 rounded-lg transition-colors duration-200 min-h-[44px] flex items-center"
            >
              My Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="font-body text-sm font-semibold text-teal-light hover:text-warm-white border border-teal/30 hover:border-teal/60 px-5 py-2 rounded-lg transition-colors duration-200 min-h-[44px] flex items-center"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
