import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep /schedule as the landing page, but allow navigation
  // to the rest of the app (including /schedule/records/*).
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/schedule";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Apply to everything except Next internals + static assets + API routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};


