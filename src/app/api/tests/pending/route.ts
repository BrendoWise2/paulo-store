import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const payload = await getAuthPayload();
        if (!payload?.sub) return NextResponse.json({ users: [] }, { status: 401 });

        const userId = payload.sub;

        // Find enrollments for this user that are approved
        const enrollments = await prisma.enrollment.findMany({
            where: { userId, isApproved: true },
            include: { book: { select: { id: true, title: true } } },
        });

        // For each enrollment, check if there's an exam and whether user passed
        const results = [] as any[];

        for (const e of enrollments) {
            const exams = await prisma.exam.findMany({ where: { bookId: e.bookId } });
            if (exams.length === 0) continue; // no exam for this book

            // For simplicity assume one exam per book (take first)
            const exam = exams[0];

            const passedAttempt = await prisma.examAttempt.findFirst({ where: { examId: exam.id, userId, passed: true } });

            if (!passedAttempt) {
                const attemptsCount = await prisma.examAttempt.count({ where: { examId: exam.id, userId } });
                results.push({
                    enrollmentId: e.id,
                    bookId: e.bookId,
                    title: e.book.title,
                    examId: exam.id,
                    examTitle: exam.title,
                    attempts: attemptsCount,
                });
            }
        }

        return NextResponse.json({ pending: results }, { status: 200 });
    } catch (err: any) {
        const msg = err?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
