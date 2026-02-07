import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";
import BookViewerClient from "./viewer.client";

export default async function BookViewerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: bookId } = await params;
    let userId = "";

    try {
        userId = await getAuthUserId();
    } catch {
        redirect("/login");
    }

    const enrollment = await prisma.enrollment.findFirst({
        where: { userId, bookId, isApproved: true },
        select: { id: true },
    });

    if (!enrollment) {
        redirect("/protected/dashboard/user/books");
    }

    const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { title: true },
    });

    if (!book) {
        redirect("/protected/dashboard/user/books");
    }

    return <BookViewerClient bookId={bookId} title={book.title} />;
}
