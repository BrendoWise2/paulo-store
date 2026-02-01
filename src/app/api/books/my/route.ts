import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";

export async function GET() {
    try {
        const userId = await getAuthUserId(); // ✅ AQUI

        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId,
                isApproved: true,
            },
            include: {
                book: true,
            },
            orderBy: { createdAt: "desc" },
        });

        const books = enrollments.map((e) => e.book);

        return NextResponse.json(books, { status: 200 });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
