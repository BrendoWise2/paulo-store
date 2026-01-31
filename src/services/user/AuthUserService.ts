import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

interface AuthRequest {
    email: string;
    password: string;
}

export class AuthUserService {
    async execute({ email, password }: AuthRequest) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
                emailVerified: true,
                companyId: true,
            },
        });

        if (!user) throw new Error("User/Password incorrect");
        if (!user.emailVerified) {
            throw new Error("E-mail não verificado. Verifique sua caixa de entrada.");
        }

        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) throw new Error("User/Password incorrect");

        const token = sign(
            {
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
            },
            process.env.JWT_SECRET!,
            { subject: user.id, expiresIn: "30d" }
        );

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        };
    }
}
