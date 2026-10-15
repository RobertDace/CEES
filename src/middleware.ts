import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteksi rute admin pada tingkat server / edge
  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("cees_admin_token")?.value;

    if (!adminToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Proteksi rute member pada tingkat server / edge
  if (pathname.startsWith("/member")) {
    const memberToken = request.cookies.get("cees_member_token")?.value;
    const adminToken = request.cookies.get("cees_admin_token")?.value;

    if (!memberToken && !adminToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*"],
};
