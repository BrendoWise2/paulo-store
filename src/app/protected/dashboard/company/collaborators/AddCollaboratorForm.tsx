"use client";
import { useState } from "react";

type Props = {
    companyId?: string;
    companies?: { id: string; name: string; cnpj?: string }[];
    onCreate?: (user: { id: string; name: string; email: string; companyId?: string | null }) => void;
    onClose?: () => void;
};

export default function AddCollaboratorForm({ companyId, companies, onCreate, onClose }: Props) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedCompany, setSelectedCompany] = useState<string | undefined>(companyId ?? companies?.[0]?.id);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !name) return alert("Preencha todos os campos");
        if (!companyId && !selectedCompany) return alert("Selecione uma empresa");

        setLoading(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, companyId: companyId ?? selectedCompany, role: "USER" }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || data.error || "Erro ao criar usuário");
            } else {
                onCreate && onCreate({ id: data.id, name: data.name, email: data.email, companyId: data.companyId });
                setName("");
                setEmail("");
                setPassword("");
                onClose && onClose();
            }
        } catch (err) {
            alert("Erro ao criar usuário");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ background: "white", border: "1px solid var(--border)", padding: 12, borderRadius: 12, boxShadow: "var(--shadow)", marginBottom: 12 }}>
            {!companyId && companies && (
                <div style={{ marginBottom: 8 }}>
                    <label style={{ fontWeight: 700, marginRight: 8 }}>Empresa</label>
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

            <div style={{ display: "grid", gap: 8 }}>
                <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 8, borderRadius: 8 }} />
                <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 8, borderRadius: 8 }} />
                <input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: 8, borderRadius: 8 }} />

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => onClose && onClose()} style={{ padding: "8px 12px", borderRadius: 8, background: "transparent", border: "1px solid var(--border)" }} disabled={loading}>
                        Cancelar
                    </button>
                    <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "white", border: "none" }} disabled={loading}>
                        {loading ? "Criando..." : "Criar colaborador"}
                    </button>
                </div>
            </div>
        </form>
    );
}
