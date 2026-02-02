// approvals company/page.tsx
import styles from "./page.module.scss";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // ✅ status robusto (string OU string[])
    const statusParam = Array.isArray(searchParams?.status)
        ? searchParams?.status[0]
        : searchParams?.status;

    const status: "pending" | "approved" | "all" =
        statusParam === "approved" || statusParam === "all" || statusParam === "pending"
            ? statusParam
            : "pending";

    const statusWhere =
        status === "all" ? {} : status === "approved" ? { isApproved: true } : { isApproved: false };

    const baseWhere = { companyId: me.companyId, ...statusWhere };

    const [rows, counts] = await Promise.all([
        prisma.enrollment.findMany({
            where: baseWhere,
            include: {
                user: { select: { id: true, name: true, email: true } },
                book: { select: { id: true, title: true } },
                company: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.enrollment.groupBy({
            by: ["isApproved"],
            where: { companyId: me.companyId },
            _count: { _all: true },
        }),
    ]);

    const pendingCount = counts.find((c) => c.isApproved === false)?._count._all ?? 0;
    const approvedCount = counts.find((c) => c.isApproved === true)?._count._all ?? 0;
    const allCount = pendingCount + approvedCount;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Aprovações (Empresa)</h1>
                    <p className={styles.subtitle}>Aprove ou reprove acessos da sua empresa</p>

                    <div className={styles.filters}>
                        <a className={status === "pending" ? styles.active : ""} href="?status=pending">
                            Pendentes ({pendingCount})
                        </a>
                        <a className={status === "approved" ? styles.active : ""} href="?status=approved">
                            Aprovados ({approvedCount})
                        </a>
                        <a className={status === "all" ? styles.active : ""} href="?status=all">
                            Todos ({allCount})
                        </a>
                    </div>
                </div>
            </header>

            <main className={styles.container}>
                {rows.length === 0 ? (
                    <div className={styles.empty}>Nada aqui por enquanto 🎉</div>
                ) : (
                    <div className={styles.table}>
                        <div className={styles.thead}>
                            <div>Colaborador</div>
                            <div>Livro</div>
                            <div>Empresa</div>
                            <div>Ações</div>
                        </div>

                        {rows.map((r) => (
                            <div key={r.id} className={styles.tr}>
                                <div className={styles.userCell}>
                                    <div className={styles.userName}>{r.user.name}</div>
                                    <div className={styles.userEmail}>{r.user.email}</div>
                                </div>

                                <div className={styles.bookCell}>{r.book.title}</div>
                                <div className={styles.companyCell}>{r.company.name}</div>

                                <div className={styles.actions}>
                                    {!r.isApproved ? (
                                        <form action="/api/enrollments/approve" method="POST">
                                            <input type="hidden" name="enrollmentId" value={r.id} />
                                            <button className={styles.btnApprove} type="submit">
                                                Aprovar
                                            </button>
                                        </form>
                                    ) : (
                                        <form action="/api/enrollments/revoke" method="POST">
                                            <input type="hidden" name="enrollmentId" value={r.id} />
                                            <button className={styles.btnRevoke} type="submit">
                                                Reprovar
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
