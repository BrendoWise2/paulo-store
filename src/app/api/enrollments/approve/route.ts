import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId, requireRole } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        // ✅ Apenas admin libera (ajuste se quiser)
        await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);

        const adminUserId = await getAuthUserId(); // não vamos usar agora, mas ok

        const { userId, bookId, companyId } = await req.json();

        if (!userId || !bookId) {
            return NextResponse.json(
                { message: "userId e bookId são obrigatórios" },
                { status: 400 }
            );
        }

        // Se no seu schema companyId for obrigatório, você precisa enviar.
        // Se for opcional, pode remover essa validação.
        if (!companyId) {
            return NextResponse.json(
                { message: "companyId é obrigatório no seu schema atual" },
                { status: 400 }
            );
        }

        const enrollment = await prisma.enrollment.upsert({
            where: { userId_bookId: { userId, bookId } },
            update: { isApproved: true, companyId },
            create: {
                userId,
                bookId,
                companyId,
                isApproved: true,
            },
        });

        return NextResponse.json(enrollment, { status: 201 });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
