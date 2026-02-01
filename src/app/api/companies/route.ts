import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);

        const { name, cnpj } = await req.json();

        if (!name || !cnpj) {
            return NextResponse.json(
                { message: "name e cnpj são obrigatórios" },
                { status: 400 }
            );
        }

        const company = await prisma.company.create({
            data: { name, cnpj },
            select: { id: true, name: true, cnpj: true, isActive: true, createdAt: true },
        });

        return NextResponse.json(company, { status: 201 });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}

export async function GET() {
    try {
        await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);

        const companies = await prisma.company.findMany({
            select: { id: true, name: true, cnpj: true, isActive: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(companies);
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
