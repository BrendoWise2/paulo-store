import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

type JwtPayload = {
    sub: string;
    role: "SUPER_ADMIN" | "COMPANY_ADMIN" | "USER";
    companyId?: string | null;
    name?: string;
    email?: string;
};

export async function getAuth() {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;

    try {
        const payload = verify(token, process.env.JWT_SECRET!) as JwtPayload;
        return { token, payload };
    } catch {
        return null;
    }
}

export function requireAuth() {
    const auth = getAuth();
    if (!auth) throw new Error("Não autenticado");
    return auth;
}

export function requireRole(allowed: JwtPayload["role"][]) {
    const { payload } = requireAuth();
    if (!allowed.includes(payload.role)) throw new Error("Sem permissão");
    return payload;
}
