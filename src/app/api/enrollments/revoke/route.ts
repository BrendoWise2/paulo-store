import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getAuthPayload } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);
        const payload = await getAuthPayload();

        const body = await req.json();
        const { enrollmentId } = body as { enrollmentId: string };

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
            data: { isApproved: false },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
