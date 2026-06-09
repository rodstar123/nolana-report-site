import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const GEO_ALLOWLIST = new Set(["US", "MX"]);
const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const res = intlMiddleware(req);

  // Geo-filter cookie: GA4 only fires for US/MX visitors.
  const country = req.headers.get("x-vercel-ip-country") ?? "";
  const geoAllowed = GEO_ALLOWLIST.has(country) || !country;
  res.cookies.set("_geo_ok", geoAllowed ? "1" : "0", {
    httpOnly: false,
    sameSite: "strict",
    path: "/",
  });

  res.headers.set(
    "Content-Language",
    req.nextUrl.pathname.startsWith("/es") ? "es" : "en",
  );

  // If intl middleware is redirecting, return early with geo cookie
  if (res.status >= 300 && res.status < 400) {
    return res;
  }

  // Auth: protect /account and /admin (strip locale prefix for matching)
  const pathname = req.nextUrl.pathname;
  const pathWithoutLocale = pathname.replace(/^\/es(?=\/|$)/, "") || "/";
  const isProtected =
    pathWithoutLocale.startsWith("/account") ||
    pathWithoutLocale.startsWith("/admin");

  if (isProtected) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const isSpanish = pathname.startsWith("/es");
      const loginPath = isSpanish ? "/es/login" : "/login";
      const loginUrl = new URL(loginPath, req.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|auth|_next/static|_next/image|favicon\\.ico|icon\\.(?:png|svg)|apple-icon\\.png|images|feed\\.xml|fonts|llms\\.txt|sitemap|robots\\.txt).*)",
  ],
};
