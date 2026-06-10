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

  // Role-based access: only role_id 4 can access /protected/partners
  if (pathname.startsWith("/protected/admin/partners")) {
    const roleId = nextAuthToken?.role_id as number | null ?? null;
    if (roleId !== 4) {
      return NextResponse.redirect(new URL("/protected/admin/profile", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*"],
};
