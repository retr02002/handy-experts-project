import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Route protections based on roles
    if (pathname.startsWith("/admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    
    if (pathname.startsWith("/vendor") && token?.role !== "VENDOR") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    
    if (pathname.startsWith("/customer") && token?.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    
    if (pathname.startsWith("/technician") && token?.role !== "TECHNICIAN") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/sign-in",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_12345",
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/vendor/:path*",
    "/customer/:path*",
    "/technician/:path*",
    "/cart",
  ],
};
