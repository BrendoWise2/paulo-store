import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const { payload } = requireAuth();

        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                companyId: true,
            },
        });

        return NextResponse.json(user);
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 401 });
    }
}
