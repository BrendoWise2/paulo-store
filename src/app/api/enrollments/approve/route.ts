import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getAuthPayload } from "@/lib/auth";

async function readEnrollmentId(req: Request): Promise<string | null> {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        const body = await req.json().catch(() => null);
        return body?.enrollmentId ?? null;
    }

    const form = await req.formData().catch(() => null);
    const val = form?.get("enrollmentId");
    return typeof val === "string" ? val : null;
}

function isFormRequest(req: Request) {
    const ct = req.headers.get("content-type") ?? "";
    return ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data");
}

export async function POST(req: Request) {
    try {
        await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);
        const payload = await getAuthPayload();

        const enrollmentId = await readEnrollmentId(req);
        if (!enrollmentId) {
            return NextResponse.json({ message: "enrollmentId is required" }, { status: 400 });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            select: { id: true, companyId: true },
        });

        if (!enrollment) {
            return NextResponse.json({ message: "Enrollment not found" }, { status: 404 });
        }

        // COMPANY_ADMIN só aprova da própria empresa
        if (payload.role === "COMPANY_ADMIN") {
            const me = await prisma.user.findUnique({
                where: { id: payload.sub },
                select: { companyId: true },
            });

            if (!me?.companyId || me.companyId !== enrollment.companyId) {
                return NextResponse.json({ message: "Forbidden" }, { status: 403 });
            }
        }

        const updated = await prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { isApproved: true },
        });

        // ✅ Se for <form> no browser: redirect (melhor UX)
        if (isFormRequest(req)) {
            const back = req.headers.get("referer") ?? "/protected/dashboard/company/approvals";
            return NextResponse.redirect(new URL(back), { status: 303 });
        }

        // ✅ Se for API (Insomnia/fetch): JSON
        return NextResponse.json(updated, { status: 200 });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
