import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

interface UserRequest {
    name: string;
    email: string;
    password: string;
    role?: Role;
    companyId?: string | null;
}

function capitalizeName(name: string) {
    if (!name) return "";
    return name
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

export class CreateUserService {
    async execute({ name, email, password, role, companyId }: UserRequest) {
        if (!email) throw new Error("Email Incorrect");

        const userAlreadyExist = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (userAlreadyExist) throw new Error("User already exist");

        const passwordHash = await hash(password, 8);

        // token simples (igual seu antigo)
        const rawToken = Math.random().toString(36).substring(2) + Date.now();
        const token = Buffer.from(rawToken, "utf8").toString("base64url");

        const formattedName = capitalizeName(name);

        const user = await prisma.user.create({
            data: {
                name: formattedName,
                email,
                password: passwordHash,
                role: role ?? "USER",
                emailVerified: false,
                verificationToken: token,
                companyId: companyId ?? null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                companyId: true,
            },
        });

        // Por enquanto SEM e-mail (você pediu sem seed e quer testar logo)
        // Depois a gente pluga sendVerificationEmail(email, token)

        return { ...user, verificationToken: token }; // opcional: retornar token p/ testar
    }
}
