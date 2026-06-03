import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const GEO_ALLOWLIST = new Set(["US", "MX"]);

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Geo-filter cookie: GA4 only fires for US/MX visitors.
  // Header absent in local dev → default to allowed.
  const country = req.headers.get("x-vercel-ip-country") ?? "";
  const geoAllowed = GEO_ALLOWLIST.has(country) || !country;
  res.cookies.set("_geo_ok", geoAllowed ? "1" : "0", {
    httpOnly: false,
    sameSite: "strict",
    path: "/",
  });

  // Auth: only for protected routes
  const isProtected =
    req.nextUrl.pathname.startsWith("/account") ||
    req.nextUrl.pathname.startsWith("/admin");

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
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|images|feed\\.xml).*)",
  ],
};
