import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Make schedule the only public page for now.
  if (pathname !== "/schedule") {
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
