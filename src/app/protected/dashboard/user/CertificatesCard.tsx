"use client";

import styles from "../company/approvals/page.module.scss";

export default function CertificatesCard() {
    return (
        <div className={styles.card} style={{ marginBottom: 16 }}>
            <div className={styles.cardContentCentered}>
                <div className={styles.cardIcon}>🎓</div>
                <div className={styles.cardTitle}>Meus Certificados</div>
                <div style={{ marginTop: 8, color: 'var(--muted)' }}>Seus certificados aparecem aqui quando emitidos.</div>
            </div>

            <div className={styles.cardBody}>
                <div style={{ textAlign: 'center' }}>Nenhum certificado (scaffold).</div>
            </div>
        </div>
    );
}
