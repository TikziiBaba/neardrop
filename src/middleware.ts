import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, internal files, API routes, auth callbacks, and public share links
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/s/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Redirect root "/" to "/tr"
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/tr";
    return NextResponse.redirect(url, 307);
  }

  // 3. Exact "/tr" or "/en" -> rewrite to "/"
  if (pathname === "/tr" || pathname === "/en") {
    const locale = pathname.slice(1);
    const url = request.nextUrl.clone();
    url.pathname = "/";
    const response = NextResponse.rewrite(url);
    response.headers.set("x-neardrop-locale", locale);
    return response;
  }

  // 4. Subpaths "/tr/:path*" or "/en/:path*" -> rewrite to "/:path*"
  if (pathname.startsWith("/tr/") || pathname.startsWith("/en/")) {
    const locale = pathname.slice(1, 3);
    const subpath = pathname.slice(3); // e.g. "/pricing"
    const url = request.nextUrl.clone();
    url.pathname = subpath || "/";
    const response = NextResponse.rewrite(url);
    response.headers.set("x-neardrop-locale", locale);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, sw.js, manifest.json
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|sw.js|manifest.json).*)",
  ],
};
