import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";

export async function GET() {
    try {
        const userId = await getAuthUserId();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, companyId: true },
        });

        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        return NextResponse.json(user);
    } catch (e: any) {
        return NextResponse.json({ message: e?.message ?? "Unauthorized" }, { status: 401 });
    }
}
