import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

function isProtected(pathname: string) {
  return pathname.startsWith("/protected");
}

function getUserRoleIdFromToken(token: any): number | null {
  const organization = token?.organization;
  if (!organization) return null;
  const userId = String(token.id ?? token.sub);
  for (const branch of organization.branches ?? []) {
    const found = (branch.users ?? []).find((u: any) => String(u.id) === userId);
    if (found) return found.role_id ?? null;
  }
  return null;
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
  if (pathname.startsWith("/protected/partners")) {
    const roleId = getUserRoleIdFromToken(nextAuthToken);
    if (roleId !== 4) {
      return NextResponse.redirect(new URL("/protected/profile", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*"],
};
