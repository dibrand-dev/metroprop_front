import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

function isProtected(pathname: string) {
  return pathname.startsWith("/protected");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const customToken = req.cookies.get("authToken")?.value;
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    console.error("❌ NEXTAUTH_SECRET  is not defined in environment variables");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const nextAuthToken = await getToken({
    req,
    secret,
  });

  if (!customToken && !nextAuthToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*"],
};
