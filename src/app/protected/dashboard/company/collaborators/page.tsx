import styles from "./page.module.scss";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AssignUsersList from "./AssignUsersList";

type Props = {};

export default async function CompanyCollaboratorsPage({ }: Props) {
    let payload;
    try {
        payload = await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);
    } catch {
        redirect("/login");
    }

    const me = await prisma.user.findUnique({ where: { id: payload.sub }, select: { companyId: true, role: true } });

    // se for COMPANY_ADMIN, obrigar ter companyId
    if (me?.role === "COMPANY_ADMIN" && !me?.companyId) {
        redirect("/protected/dashboard/company");
    }

    // buscar usuários: excluir administradores (SUPER_ADMIN, COMPANY_ADMIN)
    const baseWhere = { role: { notIn: ["SUPER_ADMIN", "COMPANY_ADMIN"] } };

    // COMPANY_ADMIN vê só os usuários da sua empresa; SUPER_ADMIN vê todos (exceto admins)
    const users = await prisma.user.findMany({
        where: me?.role === "COMPANY_ADMIN" ? { AND: [baseWhere, { companyId: me.companyId }] } : baseWhere,
        select: { id: true, name: true, email: true, companyId: true },
        orderBy: { createdAt: "desc" },
    });

    const books = await prisma.book.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } });
    // buscar empresas apenas para SUPER_ADMIN (para permitir escolher a empresa ao vincular)
    const companies = me?.role === "SUPER_ADMIN" ? await prisma.company.findMany({ select: { id: true, name: true, cnpj: true }, orderBy: { name: "asc" } }) : undefined;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Colaboradores (Vincular)</h1>
                    <p className={styles.subtitle}>Vincule usuários à sua empresa</p>
                </div>
            </header>

            <main className={styles.container}>
                {/* Sempre renderiza o componente cliente para permitir criar usuários mesmo quando a lista estiver vazia */}
                {/* @ts-ignore Server -> Client serialização */}
                <AssignUsersList users={users} books={books} companyId={me.companyId ?? undefined} companies={companies} />
            </main>
        </div>
    );
}
