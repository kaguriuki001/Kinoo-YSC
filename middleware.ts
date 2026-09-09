import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "kinoo-ysc-secret-key-2026"
  });

  const isLoggedIn = !!token;
  const userRoles = (token?.roles as string[]) || [];

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = { 
  matcher: ["/dashboard/:path*"] 
};