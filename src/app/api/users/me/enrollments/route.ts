import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";

export async function GET() {
    try {
        const payload = await getAuthPayload();
        if (!payload?.sub) return NextResponse.json({ enrollments: [] }, { status: 401 });

        const userId = payload.sub;

        const enrollments = await prisma.enrollment.findMany({
            where: { userId, isApproved: true },
            include: { book: { select: { id: true, title: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ enrollments }, { status: 200 });
    } catch (err: any) {
        const msg = err?.message ?? 'Erro';
        const status = msg === 'Unauthorized' ? 401 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
