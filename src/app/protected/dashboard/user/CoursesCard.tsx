"use client";

import styles from "../company/approvals/page.module.scss";

export default function CoursesCard() {
    return (
        <div className={styles.card} style={{ marginBottom: 16 }}>
            <div className={styles.cardHeader}>
                <div>
                    <div style={{ fontWeight: 800, color: "var(--text)" }}>Meus Cursos</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>Acesse os livros vinculados a você</div>
                </div>
            </div>

            <div className={styles.cardBody}>
                <div>Nenhum curso implementado (scaffold).</div>
            </div>
        </div>
    );
}
