import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export type JwtPayload = {
    sub: string;
    email?: string;
    role?: "SUPER_ADMIN" | "COMPANY_ADMIN" | "USER";
    name?: string;
};

export async function getAuthPayload(): Promise<JwtPayload> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    return verify(token, process.env.JWT_SECRET!) as JwtPayload;
}

export async function getAuthUserId(): Promise<string> {
    const payload = await getAuthPayload();

    if (!payload.sub) {
        throw new Error("Unauthorized");
    }

    return payload.sub;
}

export async function requireRole(
    roles: Array<JwtPayload["role"]>
): Promise<JwtPayload> {
    const payload = await getAuthPayload();

    if (!payload.role || !roles.includes(payload.role)) {
        throw new Error("Forbidden");
    }

    return payload;
}
