import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    const { pathname } = req.nextUrl;

    // Rotas públicas
    if (pathname.startsWith("/login") || pathname.startsWith("/api/auth/login")) {
        return NextResponse.next();
    }

    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    try {
        const payload = verify(token, process.env.JWT_SECRET!) as any;
        const role = payload.role as string;

        // Proteção por área
        if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/student", req.url));
        }

        if (pathname.startsWith("/company") && !["SUPER_ADMIN", "COMPANY_ADMIN"].includes(role)) {
            return NextResponse.redirect(new URL("/student", req.url));
        }

        if (pathname.startsWith("/student") && !["SUPER_ADMIN", "COMPANY_ADMIN", "USER"].includes(role)) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        return NextResponse.next();
    } catch {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }
}

export const config = {
    matcher: ["/admin/:path*", "/company/:path*", "/student/:path*"],
};
