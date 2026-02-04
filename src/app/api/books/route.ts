import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

function uploadBufferToCloudinary(opts: {
    buffer: Buffer;
    folder: string;
    resource_type: "image" | "raw";
}) {
    const { buffer, folder, resource_type } = opts;

    return new Promise<{ public_id: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type,
                type: "authenticated", // 🔒 privado
            },
            (err, result) => {
                if (err || !result) return reject(err);
                resolve({ public_id: result.public_id });
            }
        );

        stream.end(buffer);
    });
}

export async function POST(req: Request) {
    try {
        await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);

        const form = await req.formData();

        const title = String(form.get("title") ?? "").trim();
        const description = String(form.get("description") ?? "").trim() || null;

        const pdfFile = form.get("pdfFile");
        const coverFile = form.get("coverFile");

        if (!title) {
            return NextResponse.json({ message: "title é obrigatório" }, { status: 400 });
        }
        if (!(pdfFile instanceof File)) {
            return NextResponse.json({ message: "pdfFile é obrigatório" }, { status: 400 });
        }

        // PDF (raw)
        const pdfBuf = Buffer.from(await pdfFile.arrayBuffer());
        const pdfUp = await uploadBufferToCloudinary({
            buffer: pdfBuf,
            folder: "paulo-store/books/pdfs",
            resource_type: "raw",
        });

        // Cover (image) opcional
        let coverPublicId: string | null = null;
        if (coverFile instanceof File) {
            const coverBuf = Buffer.from(await coverFile.arrayBuffer());
            const coverUp = await uploadBufferToCloudinary({
                buffer: coverBuf,
                folder: "paulo-store/books/covers",
                resource_type: "image",
            });
            coverPublicId = coverUp.public_id;
        }

        const book = await prisma.book.create({
            data: {
                title,
                description,
                pdfUrl: pdfUp.public_id,          // ✅ guarda public_id
                coverImage: coverPublicId,        // ✅ guarda public_id
            },
        });

        return NextResponse.json(book, { status: 201 });
    } catch (e: any) {
        const msg = e?.message ?? "Erro";
        const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
        return NextResponse.json({ message: msg }, { status });
    }
}
