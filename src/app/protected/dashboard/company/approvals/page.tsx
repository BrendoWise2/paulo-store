// approvals company/page.tsx
import styles from "./page.module.scss";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import ApprovalsClient from "./ApprovalsClient";

type Props = {
    searchParams?: { status?: string | string[] };
};

export default async function CompanyApprovalsPage({ searchParams }: Props) {
    let payload;
    try {
        payload = await requireRole(["COMPANY_ADMIN"]);
    } catch {
        redirect("/login");
    }

    // companyId vem do banco
    const me = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { companyId: true },
    });

    if (!me?.companyId) {
        redirect("/protected/dashboard/company");
    }

    // Just require role / company here; the client component will fetch data and render filters

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Aprovações (Empresa)</h1>
                    <p className={styles.subtitle}>Aprove ou reprove acessos da sua empresa</p>
                </div>
            </header>

            <ApprovalsClient />
        </div>
    );
}
