"use client";

import Link from "next/link";
import styles from "../company/approvals/page.module.scss";

export default function TreinamentosCard() {
    return (
        <Link href="/protected/dashboard/user/books" className={`${styles.card} ${styles.cardCompact}`} style={{ marginBottom: 16, minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center', textDecoration: 'none' }}>
            <div className={styles.cardContentCentered}>
                <div className={styles.cardIcon}>📚</div>
                <div className={styles.cardTitle}>Meus Treinamentos</div>
                <div style={{ marginTop: 8, color: 'var(--muted)' }}>Veja e abra seus cursos.</div>
            </div>
        </Link>
    );
}

