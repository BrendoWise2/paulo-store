import { NextResponse } from "next/server";
import { AuthUserService } from "@/services/user/AuthUserService";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const service = new AuthUserService();
        const auth = await service.execute({ email, password });

        // Salva token em cookie httpOnly
        const res = NextResponse.json(
            { id: auth.id, name: auth.name, email: auth.email, role: auth.role },
            { status: 200 }
        );

        res.cookies.set("token", auth.token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            // secure: true, // ligue em produção HTTPS
            maxAge: 60 * 60 * 24 * 30, // 30 dias
        });

        return res;
    } catch (e: any) {
        return NextResponse.json(
            { error: "Bad Request", message: e.message ?? "Erro no login" },
            { status: 400 }
        );
    }
}
