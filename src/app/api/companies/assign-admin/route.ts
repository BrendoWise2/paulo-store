import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        await requireRole(["SUPER_ADMIN"]);

        const body = await req.json().catch(() => null);
        const userId = (body?.userId ?? "").trim();
        const companyId = (body?.companyId ?? "").trim();

        if (!userId || !companyId) {
            return NextResponse.json(
                { message: "userId e companyId são obrigatórios" },
                { status: 400 }
            );
        }

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true },
        });
        if (!company) return NextResponse.json({ message: "Company not found" }, { status: 404 });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { companyId, role: "COMPANY_ADMIN" },
            select: { id: true, name: true, email: true, role: true, companyId: true },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
