import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isLoggedIn = !!token;
  const userRoles = (token?.roles as string[]) || [];

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const rolePaths: Record<string, string> = {
    member: '/dashboard/member',
    secretary: '/dashboard/secretary',
    treasurer: '/dashboard/treasurer',
    organizing_secretary: '/dashboard/organizing-secretary',
    vice_secretary: '/dashboard/vice-secretary',
    liturgist: '/dashboard/liturgist',
    vice_moderator: '/dashboard/vice-moderator',
    moderator: '/dashboard/moderator',
    patron_matron: '/dashboard/patron-matron',
    father: '/dashboard/father'
  };

  const allowed = userRoles.some(role => pathname.startsWith(rolePaths[role]));
  if (!allowed && !userRoles.includes('father')) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = { 
  matcher: ["/dashboard/:path*"] 
};
