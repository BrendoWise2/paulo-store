import { NextResponse } from "next/server";
import { AuthUserService } from "@/services/user/AuthUserService";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const service = new AuthUserService();
        const { token, user } = await service.execute({ email, password });

        const response = NextResponse.json(user);

        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 dias
        });

        return response;
    } catch (e: any) {
        return NextResponse.json(
            { message: e.message ?? "Erro ao autenticar" },
            { status: 401 }
        );
    }
}
