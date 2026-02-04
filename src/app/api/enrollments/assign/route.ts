import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        // Quem pode vincular:
        // - SUPER_ADMIN (vincula qualquer user/empresa)
        // - COMPANY_ADMIN (vincula apenas dentro da própria empresa) -> você pode apertar isso depois
        await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);

        const body = await req.json().catch(() => null);
        const userId = String(body?.userId ?? "").trim();
        const bookId = String(body?.bookId ?? "").trim();
        const companyId = String(body?.companyId ?? "").trim();

        if (!userId || !bookId || !companyId) {
            return NextResponse.json(
                { message: "userId, bookId e companyId são obrigatórios" },
                { status: 400 }
            );
        }

        // valida existência básica
        const [user, book, company] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
            prisma.book.findUnique({ where: { id: bookId }, select: { id: true } }),
            prisma.company.findUnique({ where: { id: companyId }, select: { id: true, isActive: true } }),
        ]);

        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
        if (!book) return NextResponse.json({ message: "Book not found" }, { status: 404 });
        if (!company) return NextResponse.json({ message: "Company not found" }, { status: 404 });
        if (!company.isActive) return NextResponse.json({ message: "Company inactive" }, { status: 400 });

        // Como seu schema tem @@unique([userId, bookId]),
        // o Prisma gera o unique composto "userId_bookId"
        const enrollment = await prisma.enrollment.upsert({
            where: {
                userId_bookId: { userId, bookId },
            },
            update: {
                companyId,
                isApproved: false, // fica pendente quando (re)vincula
            },
            create: {
                userId,
                bookId,
                companyId,
                isApproved: false,
            },
            select: { id: true, userId: true, bookId: true, companyId: true, isApproved: true, createdAt: true },
        });

        return NextResponse.json(enrollment, { status: 201 });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
