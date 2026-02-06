"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.scss";

type UserRow = {
    user: { id: string; name: string; email: string };
    books: { enrollmentId: string; title: string; isApproved: boolean }[];
};

export default function ApprovalsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<string>(searchParams.get("status") ?? "pending");
    const [users, setUsers] = useState<UserRow[]>([]);
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [counts, setCounts] = useState({ pendingCount: 0, approvedCount: 0, allCount: 0 });
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const sp = searchParams.get("status") ?? "pending";
        setStatus(sp);
    }, [searchParams]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const res = await fetch(`/api/enrollments/company-approvals?status=${encodeURIComponent(status)}`);
            if (res.ok) {
                const json = await res.json();
                setUsers(json.users ?? []);
                setCompanyName(json.companyName ?? null);
                setCounts(json.counts ?? { pendingCount: 0, approvedCount: 0, allCount: 0 });
                setExpanded({}); // reset expansion when data changes
            } else if (res.status === 401 || res.status === 403) {
                router.push("/login");
            }
            setLoading(false);
        }
        fetchData();
    }, [status, router]);

    async function handleAction(enrollmentId: string, action: "approve" | "revoke") {
        const url = `/api/enrollments/${action}`;
        const form = new FormData();
        form.append("enrollmentId", enrollmentId);
        const res = await fetch(url, { method: "POST", body: form });
        if (res.ok) {
            // refetch
            const res2 = await fetch(`/api/enrollments/company-approvals?status=${encodeURIComponent(status)}`);
            const json = await res2.json();
            setUsers(json.users ?? []);
            setCounts(json.counts ?? counts);
        }
    }

    function toggleExpand(id: string) {
        setExpanded((s) => ({ ...s, [id]: !s[id] }));
    }

    return (
        <>
            <div className={styles.filtersWrap}>
                <div className={styles.filters}>
                    <a className={status === "pending" ? styles.active : ""} href={`/protected/dashboard/company/approvals?status=pending`}>
                        Pendentes ({counts.pendingCount})
                    </a>
                    <a className={status === "approved" ? styles.active : ""} href={`/protected/dashboard/company/approvals?status=approved`}>
                        Aprovados ({counts.approvedCount})
                    </a>
                    <a className={status === "all" ? styles.active : ""} href={`/protected/dashboard/company/approvals?status=all`}>
                        Todos ({counts.allCount})
                    </a>
                </div>
                <div className={styles.companyLabel}>{companyName ?? ""}</div>
            </div>

            <main className={styles.container}>
                {loading ? (
                    <div className={styles.empty}>Carregando...</div>
                ) : users.length === 0 ? (
                    <div className={styles.empty}>Nada aqui por enquanto 🎉</div>
                ) : (
                    <div className={styles.cards}>
                        {users.map((u, idx) => {
                            const cardId = `${u.user.id}-${idx}`;
                            return (
                                <div key={cardId} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <div className={styles.userName}>{u.user.name}</div>
                                            <div className={styles.userEmail}>{u.user.email}</div>
                                        </div>
                                        <div className={styles.headerActions}>
                                            <button className={styles.expandBtn} onClick={() => toggleExpand(cardId)} aria-expanded={!!expanded[cardId]}>
                                                {expanded[cardId] ? "—" : "+"}
                                            </button>
                                        </div>
                                    </div>

                                    {expanded[cardId] && (
                                        <div className={styles.cardBody}>
                                            <div className={styles.booksList}>
                                                {u.books.map((b) => (
                                                    <div key={b.enrollmentId} className={styles.bookRow}>
                                                        <div className={styles.bookTitle}>{b.title}</div>
                                                        <div className={styles.bookActions}>
                                                            {!b.isApproved ? (
                                                                <button className={styles.btnApprove} onClick={() => handleAction(b.enrollmentId, "approve")}>Aprovar</button>
                                                            ) : (
                                                                <button className={styles.btnRevoke} onClick={() => handleAction(b.enrollmentId, "revoke")}>Reprovar</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </>
    );
}
