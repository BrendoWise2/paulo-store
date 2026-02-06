import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getAuthPayload } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await requireRole(["COMPANY_ADMIN"]);
        const payload = await getAuthPayload();

        const url = new URL(req.url);
        const status = url.searchParams.get("status") ?? "pending";

        const statusWhere =
            status === "all" ? {} : status === "approved" ? { isApproved: true } : { isApproved: false };

        const me = await prisma.user.findUnique({ where: { id: payload.sub }, select: { companyId: true } });
        if (!me?.companyId) {
            return NextResponse.json({ message: "No company" }, { status: 400 });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { companyId: me.companyId, ...statusWhere },
            include: {
                user: { select: { id: true, name: true, email: true } },
                book: { select: { id: true, title: true } },
                company: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // group by user
        const map = new Map();
        for (const e of enrollments) {
            const uid = e.user.id;
            if (!map.has(uid)) map.set(uid, { user: e.user, books: [] });
            map.get(uid).books.push({ enrollmentId: e.id, title: e.book.title, isApproved: e.isApproved });
        }

        const users = Array.from(map.values());

        // counts
        const counts = await prisma.enrollment.groupBy({ by: ["isApproved"], where: { companyId: me.companyId }, _count: { _all: true } });
        const pendingCount = counts.find((c) => c.isApproved === false)?._count._all ?? 0;
        const approvedCount = counts.find((c) => c.isApproved === true)?._count._all ?? 0;
        const allCount = pendingCount + approvedCount;

        return NextResponse.json({ users, companyName: enrollments[0]?.company?.name ?? null, counts: { pendingCount, approvedCount, allCount } });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
