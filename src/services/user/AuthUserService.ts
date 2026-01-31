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
        });

        if (!user) {
            throw new Error("Email ou senha inválidos");
        }

        //VERIFICAR EMAIL DEPOIS
        /* if (!user.emailVerified) {
             throw new Error("E-mail ainda não verificado");
         }*/

        const passwordMatch = await compare(password, user.password);

        if (!passwordMatch) {
            throw new Error("Email ou senha inválidos");
        }

        const token = sign(
            {
                name: user.name,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET!,
            {
                subject: user.id,
                expiresIn: "30d",
            }
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
}
