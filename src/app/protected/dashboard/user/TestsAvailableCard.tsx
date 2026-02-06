"use client";

import { useEffect, useState } from "react";
import styles from "../company/approvals/page.module.scss";

type Item = { enrollmentId: string; bookId: string; title: string; examId: string; examTitle: string; attempts: number };

export default function TestsAvailableCard() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await fetch('/api/tests/pending');
            if (res.ok) {
                const json = await res.json();
                setItems(json.pending ?? []);
            }
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className={`${styles.card} ${styles.cardCompact}`} style={{ marginBottom: 16 }}>
            <div className={styles.cardContentCentered}>
                <div className={styles.cardIcon}>📝</div>
                <div className={styles.cardTitle}>Testes Disponíveis</div>
                <div style={{ marginTop: 8, color: 'var(--muted)' }}>Comece os testes disponíveis para certificar seus conhecimentos.</div>
            </div>

            <div className={styles.cardBody}>
                {loading ? (
                    <div style={{ textAlign: 'center' }}>Carregando...</div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center' }}>Nenhum teste disponível.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {items.map((it) => (
                            <div key={it.enrollmentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 700 }}>{it.title}</div>
                                <div>
                                    <a className={styles.btnApprove} href={`/protected/tests/start?examId=${it.examId}&enrollmentId=${it.enrollmentId}`}>
                                        Iniciar Teste
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
