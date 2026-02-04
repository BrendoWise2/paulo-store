import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET(
    req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id: bookId } = await ctx.params;

    try {
        const userId = await getAuthUserId();

        const ok = await prisma.enrollment.findFirst({
            where: { userId, bookId, isApproved: true },
            select: { id: true },
        });

        if (!ok) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const book = await prisma.book.findUnique({
            where: { id: bookId },
            select: { pdfUrl: true },
        });

        if (!book?.pdfUrl) {
            return NextResponse.json({ message: "PDF not found" }, { status: 404 });
        }

        const signedUrl = cloudinary.url(book.pdfUrl, {
            resource_type: "raw",
            type: "authenticated",
            sign_url: true,
            secure: true,
        });

        return NextResponse.redirect(signedUrl);
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
