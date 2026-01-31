import { NextResponse } from "next/server";
import { CreateUserService } from "@/services/user/CreateUserService";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const service = new CreateUserService();
        const user = await service.execute(body);

        return NextResponse.json(user, { status: 201 });
    } catch (e: any) {
        return NextResponse.json(
            { error: "Bad Request", message: e.message ?? "Erro" },
            { status: 400 }
        );
    }
}
