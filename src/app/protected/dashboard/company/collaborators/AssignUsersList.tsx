"use client";
import { useState } from "react";
import AddCollaboratorForm from "./AddCollaboratorForm";

type User = { id: string; name: string | null; email: string | null; companyId?: string | null };
type Book = { id: string; title: string };
type Company = { id: string; name: string; cnpj?: string };

export default function AssignUsersList({ users: initialUsers, books, companyId, companies }: { users: User[]; books: Book[]; companyId?: string; companies?: Company[] }) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loading, setLoading] = useState<string | null>(null);
    const [selected, setSelected] = useState<Record<string, string>>({});
    const [selectedCompany, setSelectedCompany] = useState<string | undefined>(companyId ?? companies?.[0]?.id);
    const [showForm, setShowForm] = useState(false);

    const handleAssign = async (userId: string) => {
        const bookId = selected[userId] ?? books[0]?.id;
        const companyToUse = companyId ?? selectedCompany;

        if (!bookId) return alert("Selecione um livro");
        if (!companyToUse) return alert("Selecione uma empresa");

        setLoading(userId);
        try {
            const res = await fetch("/api/enrollments/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, bookId, companyId: companyToUse }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: "Erro" }));
                alert(err.message || "Erro ao vincular");
            } else {
                // remover usuário da lista
                setUsers((s) => s.filter((u) => u.id !== userId));
            }
        } catch (e) {
            alert("Erro ao vincular");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="">
            <div className="" style={{ marginBottom: 12 }}>
                {/* Se não tiver companyId (SUPER_ADMIN), mostrar seletor de empresas */}
                {!companyId && companies && (
                    <div style={{ marginBottom: 8 }}>
                        <label style={{ marginRight: 8, fontWeight: 700 }}>Empresa:</label>
                        <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
                            <option value="">Selecione uma empresa</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} — {c.cnpj}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button onClick={() => setShowForm((s) => !s)} style={{ padding: "8px 12px", borderRadius: 8, background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "white", border: "none" }}>
                        {showForm ? "Fechar" : "Adicionar colaborador"}
                    </button>
                </div>

            </div>

            {showForm && (
                <AddCollaboratorForm
                    companyId={companyId}
                    companies={companies}
                    onClose={() => setShowForm(false)}
                    onCreate={(u) => setUsers((s) => [u as User, ...s])}
                />
            )}

            <div className="" style={{}}>
                <div className="thead" style={{ display: "grid", gridTemplateColumns: "1.3fr 1.2fr 1fr 220px", gap: 12, alignItems: "center", padding: "0.85rem 1rem" }}>
                    <div>Colaborador</div>
                    <div>Email</div>
                    <div>Livro padrão</div>
                    <div>Ações</div>
                </div>

                {users.length === 0 ? (
                    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 12, boxShadow: "var(--shadow)", color: "var(--muted)", marginTop: 12 }}>
                        Nenhum usuário disponível 🎉
                    </div>
                ) : (
                    <>
                        {users.map((u) => (
                            <div key={u.id} className="tr" style={{ display: "grid", gridTemplateColumns: "1.3fr 1.2fr 1fr 220px", gap: 12, alignItems: "center", padding: "0.85rem 1rem", borderTop: "1px solid var(--border)" }}>
                                <div>
                                    <div style={{ fontWeight: 800, color: "var(--text)" }}>{u.name ?? "-"}</div>
                                </div>

                                <div style={{ color: "var(--muted)", fontSize: 14 }}>{u.email ?? "-"}</div>

                                <div>
                                    <select value={selected[u.id] ?? (books[0]?.id ?? "")} onChange={(e) => setSelected((s) => ({ ...s, [u.id]: e.target.value }))} style={{ padding: "8px", borderRadius: 8 }}>
                                        {books.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                    <button disabled={loading === u.id} onClick={() => handleAssign(u.id)} style={{ border: "none", borderRadius: 999, padding: "0.55rem 0.9rem", fontWeight: 800, cursor: "pointer", background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "white" }}>
                                        {loading === u.id ? "Vinculando..." : "Vincular"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
