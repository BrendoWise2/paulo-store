import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        // ✅ Só SUPER_ADMIN ou COMPANY_ADMIN cria livro (ajuste como quiser)
        await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);

        const body = await req.json();
        const { title, pdfUrl, description, coverImage } = body;

        if (!title || !pdfUrl) {
            return NextResponse.json(
                { message: "title e pdfUrl são obrigatórios" },
                { status: 400 }
            );
        }

        const book = await prisma.book.create({
            data: {
                title,
                pdfUrl,
                description: description ?? null,
                coverImage: coverImage ?? null,
            },
        });

        return NextResponse.json(book, { status: 201 });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}

// opcional: listar todos os livros (para admin ou debug)
export async function GET() {
    try {
        await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);

        const books = await prisma.book.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(books);
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
