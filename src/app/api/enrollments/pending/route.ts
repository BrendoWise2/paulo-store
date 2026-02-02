import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getAuthPayload } from "@/lib/auth";

export async function GET() {
    try {
        // Só admin/empresa
        await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);
        const payload = await getAuthPayload();

        const where: any = { isApproved: false };

        // Empresa só vê o que é dela
        if (payload.role === "COMPANY_ADMIN") {
            // Aqui você precisa do companyId do usuário logado
            const me = await prisma.user.findUnique({
                where: { id: payload.sub },
                select: { companyId: true },
            });

            if (!me?.companyId) {
                return NextResponse.json({ message: "Company not set" }, { status: 400 });
            }

            where.companyId = me.companyId;
        }

        const pendings = await prisma.enrollment.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                book: { select: { id: true, title: true } },
                company: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(pendings, { status: 200 });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
