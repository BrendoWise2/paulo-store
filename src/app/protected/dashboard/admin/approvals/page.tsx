import styles from "./page.module.scss";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
    searchParams?: { status?: "pending" | "approved" | "all" };
};

export default async function AdminApprovalsPage({ searchParams }: Props) {
    let payload;
    try {
        payload = await requireRole(["SUPER_ADMIN"]);
    } catch {
        redirect("/protected/dashboard/admin");
    }

    const status = searchParams?.status ?? "pending";

    const where =
        status === "all"
            ? {}
            : status === "approved"
                ? { isApproved: true }
                : { isApproved: false };

    const [rows, counts] = await Promise.all([
        prisma.enrollment.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                book: { select: { id: true, title: true } },
                company: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.enrollment.groupBy({
            by: ["isApproved"],
            _count: { _all: true },
        }),
    ]);

    const pendingCount = counts.find(c => c.isApproved === false)?._count._all ?? 0;
    const approvedCount = counts.find(c => c.isApproved === true)?._count._all ?? 0;
    const allCount = pendingCount + approvedCount;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Aprovações (Admin)</h1>
                    <p className={styles.subtitle}>Aprove ou reprove acessos</p>

                    <div className={styles.filters}>
                        <Link className={status === "pending" ? styles.active : ""} href={{ pathname: ".", query: { status: "pending" } }}>
                            Pendentes ({pendingCount})
                        </Link>
                        <Link className={status === "approved" ? styles.active : ""} href={{ pathname: ".", query: { status: "approved" } }}>
                            Aprovados ({approvedCount})
                        </Link>
                        <Link className={status === "all" ? styles.active : ""} href={{ pathname: ".", query: { status: "all" } }}>
                            Todos ({allCount})
                        </Link>
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
