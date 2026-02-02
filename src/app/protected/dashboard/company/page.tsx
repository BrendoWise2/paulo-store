import Link from "next/link";
import styles from "./page.module.scss";
import { requireRole } from "@/lib/auth";

export default async function AdminDashboardPage() {
    const payload = await requireRole(["SUPER_ADMIN", "COMPANY_ADMIN"]);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.brand}>
                        <div className={styles.logoDot} />
                        <div>
                            <h1 className={styles.title}>Dashboard Empresa</h1>
                            <p className={styles.subtitle}>
                                Empresa
                            </p>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <span className={styles.user}>
                            {payload.name ?? "Admin"} • {payload.email ?? ""}
                        </span>
                        <Link className={styles.btnGhost} href="/protected/dashboard/user/books">
                            Ver como usuário
                        </Link>
                    </div>
                </div>
            </header>

            <main className={styles.container}>
                <section className={styles.grid}>
                    <Link className={styles.card} href="/protected/dashboard/company/approvals">
                        <div className={styles.cardIcon}>✅</div>
                        <div className={styles.cardBody}>
                            <h2>Aprovações</h2>
                            <p>Aprovar acesso de usuários aos livros.</p>
                        </div>
                    </Link>

                    <Link className={styles.card} href="/protected/dashboard/admin/books/new">
                        <div className={styles.cardIcon}>📘</div>
                        <div className={styles.cardBody}>
                            <h2>Solicitar Treinamentos e Mentoria</h2>
                            <p>Solicitar novos livros e treinamentos.</p>
                        </div>
                    </Link>

                    <Link className={styles.card} href="/protected/dashboard/admin/companies">
                        <div className={styles.cardIcon}>🏢</div>
                        <div className={styles.cardBody}>
                            <h2>Minha Empresa</h2>
                            <p>Gerenciar empresa.</p>
                        </div>
                    </Link>

                    <Link className={styles.card} href="/protected/dashboard/admin/users">
                        <div className={styles.cardIcon}>👤</div>
                        <div className={styles.cardBody}>
                            <h2>Colaboradores</h2>
                            <p>Listar colaboraderes e vincular empresa.</p>
                        </div>
                    </Link>
                </section>
            </main>
        </div>
    );
}
