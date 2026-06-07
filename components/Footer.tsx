import Image from "next/image";
import { PUBLISHER, PUBLISHER_URL } from "@/lib/constants";
import SignupForm from "./SignupForm";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-white/5"
      style={{
        background: "linear-gradient(to bottom, #0f1722 0%, #0a1221 100%)",
      }}
    >
      {/* Final CTA block */}
      <div className="py-12 md:py-20 border-b border-white/5">
        <div className="max-w-lg mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-warm-white text-2xl md:text-3xl mb-4">
            Stay ahead of the Valley.
          </h2>
          <p className="font-body text-slate-light text-sm mb-8 leading-relaxed">
            Join business owners, investors, and professionals who start their
            Monday with 30 scored RGV stories. Free forever.
          </p>
          <div className="max-w-sm mx-auto">
            <SignupForm variant="dark" />
          </div>
        </div>
      </div>

      {/* SmartBook ad slot */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-12">
        <div className="glass-nolana rounded-xl p-6 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-body text-xs text-teal-light uppercase tracking-widest mb-1 font-semibold">
              From the publisher
            </p>
            <p className="font-display font-bold text-warm-white text-lg">
              Bookkeeping for Valley businesses
            </p>
            <p className="font-body text-slate-light text-sm">
              SmartBook — starting at $350/mo
            </p>
          </div>
          <a
            href={PUBLISHER_URL}
            className="flex-shrink-0 w-full sm:w-auto text-center bg-teal hover:bg-teal-light text-white font-body font-bold text-sm px-6 py-3 rounded-lg transition-all duration-200 min-h-[48px] flex items-center justify-center hover:-translate-y-0.5"
          >
            Learn More &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/images/nr-logo-transparent.png"
                alt="The Nolana Report"
                width={28}
                height={28}
                className="h-7 w-7 flex-shrink-0"
              />
              <h3 className="font-display font-bold text-gold text-xl tracking-widest uppercase">
                The Nolana Report
              </h3>
            </div>
            <p className="font-body text-slate-light text-sm leading-relaxed">
              Business intelligence for the Rio Grande Valley. Every Monday.
            </p>
            <p className="font-body text-slate-light text-xs mt-3">
              Published by{" "}
              <a
                href={PUBLISHER_URL}
                className="text-teal-light hover:text-teal underline underline-offset-2 transition-colors"
              >
                {PUBLISHER}
              </a>
            </p>
          </div>

          <div>
            <h4 className="font-body font-bold text-warm-white text-sm uppercase tracking-widest mb-4">
              Links
            </h4>
            <ul className="space-y-2.5 font-body text-sm">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Contact", href: "mailto:info@nationalboco.com" },
                { label: "Telegram", href: "https://t.me/NolanaReport" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-light hover:text-teal-light transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-bold text-warm-white text-sm uppercase tracking-widest mb-4">
              NBC Services
            </h4>
            <ul className="space-y-2.5 font-body text-sm">
              {[
                { label: "SmartBook Bookkeeping", href: PUBLISHER_URL },
                { label: "Tax Coordination", href: PUBLISHER_URL },
                { label: "Business Consulting", href: PUBLISHER_URL },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-light hover:text-teal-light transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 py-8 pb-24 lg:pb-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-body text-slate-light text-xs">
            &copy; {year} {PUBLISHER}. All rights reserved.
          </p>
          <p className="font-body text-slate-light text-xs italic">
            Lo que se mueve en el Valle
          </p>
        </div>
      </div>
    </footer>
  );
}
