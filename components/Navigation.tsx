"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const menuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("nav");

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      ref={menuRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? "bg-navy/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="The Nolana Report — home"
          onClick={closeMenu}
        >
          <div className="relative flex items-center justify-center">
            {(scrolled || menuOpen) && (
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
              src="/images/nolana-logo-64.webp"
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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Link
            href="/money-map"
            className="font-body text-sm font-semibold text-slate-light hover:text-warm-white transition-colors duration-200 min-h-[44px] flex items-center"
          >
            {t("moneyMap")}
          </Link>
          {isHomepage && (
            <>
              <Link
                href={isLoggedIn ? "/account" : "/login"}
                className="font-body text-sm font-semibold text-slate-light hover:text-warm-white transition-colors duration-200 min-h-[44px] flex items-center"
              >
                {isLoggedIn ? t("myAccount") : t("login")}
              </Link>
              <a
                href="#pricing"
                className="font-body text-sm font-bold text-warm-white bg-teal hover:bg-teal-light px-5 py-2 rounded-lg transition-colors duration-200 min-h-[44px] flex items-center"
              >
                {t("subscribe")}
              </a>
            </>
          )}
          {!isHomepage &&
            (isLoggedIn ? (
              <Link
                href="/account"
                className="font-body text-sm font-semibold text-teal-light hover:text-warm-white border border-teal/30 hover:border-teal/60 px-5 py-2 rounded-lg transition-colors duration-200 min-h-[44px] flex items-center"
              >
                {t("myAccount")}
              </Link>
            ) : (
              <Link
                href="/login"
                className="font-body text-sm font-semibold text-teal-light hover:text-warm-white border border-teal/30 hover:border-teal/60 px-5 py-2 rounded-lg transition-colors duration-200 min-h-[44px] flex items-center"
              >
                {t("login")}
              </Link>
            ))}
        </div>

        {/* Mobile: language + theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="relative w-11 h-11 flex items-center justify-center"
          >
            <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-5 bg-warm-white rounded transition-all duration-300 origin-center ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 bg-warm-white rounded transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 bg-warm-white rounded transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-2 flex flex-col gap-1 border-t border-white/5">
          <Link
            href="/money-map"
            onClick={closeMenu}
            className="font-body text-base font-semibold text-slate-light hover:text-warm-white transition-colors py-3 min-h-[48px] flex items-center"
          >
            {t("moneyMap")}
          </Link>
          <Link
            href={isLoggedIn ? "/account" : "/login"}
            onClick={closeMenu}
            className="font-body text-base font-semibold text-slate-light hover:text-warm-white transition-colors py-3 min-h-[48px] flex items-center"
          >
            {isLoggedIn ? t("myAccount") : t("login")}
          </Link>
          {isHomepage && (
            <a
              href="#pricing"
              onClick={closeMenu}
              className="font-body text-base font-bold text-warm-white bg-teal hover:bg-teal-light px-5 py-3 rounded-lg transition-colors mt-2 min-h-[48px] flex items-center justify-center w-full"
            >
              {t("subscribe")}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
