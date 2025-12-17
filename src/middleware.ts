import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Expose pathname to RootLayout so it can hide the sidebar on /schedule.
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  // Make schedule the public landing page for now.
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/schedule";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/", "/schedule"],
};

