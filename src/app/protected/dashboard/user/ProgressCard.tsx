"use client";

import styles from "../company/approvals/page.module.scss";

export default function ProgressCard() {
    const percent = 0; // placeholder — integrate with /api/users/me/progress later

    return (
        <div className={styles.card} style={{ marginBottom: 16 }}>
            <div className={styles.cardHeader}>
                <div>
                    <div style={{ fontWeight: 800, color: "var(--text)" }}>Progresso</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>Seu progresso geral</div>
                    <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800, color: "var(--primary-dark)" }}>{percent}%</div>
                </div>
            </div>

            <div className={styles.cardBody}>
                <div style={{ color: "var(--muted)" }}>Progresso consolidado dos seus treinamentos.</div>
            </div>
        </div>
    );
}
