import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET(
    req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;

    try {
        await getAuthUserId();

        const book = await prisma.book.findUnique({
            where: { id },
            select: { coverImage: true },
        });

        if (!book?.coverImage) {
            return NextResponse.redirect(
                new URL("https://placehold.co/400x300?text=SEM+CAPA")
            );
        }

        const signedUrl = cloudinary.url(book.coverImage, {
            resource_type: "image",
            type: "authenticated",
            sign_url: true,
            secure: true,
        });

        return NextResponse.redirect(signedUrl);
    } catch {
        return NextResponse.redirect(
            new URL("https://placehold.co/400x300?text=SEM+CAPA")
        );
    }
}
