// middleware.ts
import { NextRequest, NextResponse } from "next/server";

function isProtected(pathname: string) {
  return pathname.startsWith("/protected");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Optional: validate JWT signature here
  // example using jose library

  try {
    // verifyJwt(token)
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/protected/:path*"],
};
