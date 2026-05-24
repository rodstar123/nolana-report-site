import { PUBLISHER, PUBLISHER_URL } from "@/lib/constants";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-deep border-t border-white/5 py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* SmartBook ad slot */}
        <div className="bg-teal/10 border border-teal/20 rounded-xl p-6 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-body text-xs text-teal-light uppercase tracking-widest mb-1">
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
            className="flex-shrink-0 bg-teal hover:bg-teal-light text-white font-body font-bold text-sm px-6 py-3 rounded-lg transition-colors min-h-[44px] flex items-center"
          >
            Learn More →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="font-display font-bold text-gold text-xl tracking-widest uppercase mb-3">
              The Nolana Report
            </h3>
            <p className="font-body text-slate-light text-sm leading-relaxed">
              Business intelligence for the Rio Grande Valley. Every Monday.
            </p>
            <p className="font-body text-slate-light text-xs mt-3">
              Published by{" "}
              <a
                href={PUBLISHER_URL}
                className="text-teal-light hover:text-teal underline transition-colors"
              >
                {PUBLISHER}
              </a>
            </p>
          </div>

          <div>
            <h4 className="font-body font-bold text-warm-white text-sm uppercase tracking-widest mb-4">
              Links
            </h4>
            <ul className="space-y-2 font-body text-sm">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Contact", href: "mailto:info@nationalboco.com" },
                { label: "Unsubscribe", href: "/unsubscribe" },
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
            <ul className="space-y-2 font-body text-sm">
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

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-body text-slate-light text-xs">
            © {year} {PUBLISHER}. All rights reserved.
          </p>
          <p className="font-body text-slate-light text-xs italic">
            Lo que se mueve en el Valle
          </p>
        </div>
      </div>
    </footer>
  );
}
