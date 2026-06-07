"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
          className="flex items-center gap-2 group"
          aria-label="The Nolana Report — home"
        >
          <div className="relative flex items-center justify-center">
            {scrolled && (
              <div
                className="absolute rounded-full z-0 transition-opacity duration-300"
                style={{
                  inset: "-10px",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)",
                }}
              />
            )}
            <Image
              src="/images/nolana-logo-clean.png"
              alt="The Nolana Report"
              width={32}
              height={32}
              className="relative z-10 h-8 w-8 flex-shrink-0 transition-opacity duration-200 group-hover:opacity-80"
            />
          </div>
          <span className="font-display font-bold text-gold text-sm sm:text-base tracking-wide sm:tracking-widest uppercase transition-opacity duration-200 group-hover:opacity-80">
            The Nolana<span className="hidden sm:inline"> Report</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/money-map"
            className="font-body text-sm font-semibold text-slate-light hover:text-warm-white transition-colors duration-200 min-h-[44px] flex items-center"
          >
            Money Map
          </Link>
          {isHomepage && (
            <>
              <Link
                href={isLoggedIn ? "/account" : "/login"}
                className="font-body text-sm font-semibold text-slate-light hover:text-warm-white transition-colors duration-200 min-h-[44px] flex items-center"
              >
                {isLoggedIn ? "My Account" : "Login"}
              </Link>
              <a
                href="#pricing"
                className="font-body text-sm font-bold text-warm-white bg-teal hover:bg-teal-light px-5 py-2 rounded-lg transition-colors duration-200 min-h-[44px] flex items-center"
              >
                Subscribe
              </a>
            </>
          )}
          {!isHomepage &&
            (isLoggedIn ? (
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
            ))}
        </div>
      </div>
    </nav>
  );
}
