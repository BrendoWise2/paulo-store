"use client";
import React, { useState } from "react";

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
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const passwordsMatch = password === confirmPassword;
    const canSubmit = !loading && name.trim().length > 0 && email.trim().length > 0 && password.length > 0 && confirmPassword.length > 0 && passwordsMatch;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!email || !password || !name) return setError("Preencha todos os campos");
        if (password !== confirmPassword) return setError("As senhas não conferem");

        setLoading(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, companyId: companyId ?? selectedCompany, role: "USER" }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || data.error || "Erro ao criar usuário");
            } else {
                setSuccess("Usuário criado com sucesso");
                onCreate && onCreate({ id: data.id, name: data.name, email: data.email, companyId: data.companyId });
                setName("");
                setEmail("");
                setPassword("");
                setTimeout(() => {
                    onClose && onClose();
                }, 700);
            }
        } catch (err) {
            setError("Erro ao criar usuário");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ background: "linear-gradient(180deg, #ffffff, #fbfbff)", border: "1px solid rgba(16,24,40,0.06)", padding: 20, borderRadius: 12, boxShadow: "0 10px 30px rgba(18,20,49,0.06)", marginBottom: 16, maxWidth: 920 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--primary-dark)" }}>Criar colaborador</div>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>Adicione um novo colaborador à sua empresa</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => onClose && onClose()} style={{ padding: "8px 12px", borderRadius: 8, background: "transparent", border: "1px solid rgba(16,24,40,0.06)", color: "var(--muted)" }} disabled={loading}>
                        Cancelar
                    </button>
                    <button type="submit" style={{ padding: "8px 14px", borderRadius: 10, background: canSubmit ? "linear-gradient(135deg, var(--primary), var(--primary-dark))" : "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.2))", color: "white", border: "none", fontWeight: 800, opacity: canSubmit ? 1 : 0.6, cursor: canSubmit ? "pointer" : "not-allowed" }} disabled={!canSubmit}>
                        {loading ? "Criando..." : "Criar colaborador"}
                    </button>
                </div>
            </div>

            {error && <div style={{ marginBottom: 12, color: "#b91c1c", fontWeight: 700 }}>{error}</div>}
            {success && <div style={{ marginBottom: 12, color: "#064e3b", fontWeight: 700 }}>{success}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontWeight: 700, color: "var(--text)" }}>Nome</label>
                    <input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(16,24,40,0.06)", outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontWeight: 700, color: "var(--text)" }}>Email</label>
                    <input placeholder="email@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(16,24,40,0.06)", outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontWeight: 700, color: "var(--text)" }}>Senha</label>
                    <input placeholder="Senha (mín. 8 caracteres)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(16,24,40,0.06)", outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontWeight: 700, color: "var(--text)" }}>Confirmar senha</label>
                    <input placeholder="Repita a senha" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(16,24,40,0.06)", outline: "none" }} />
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{password && confirmPassword && password !== confirmPassword ? "As senhas não conferem" : ""}</div>
                </div>
            </div>
        </form>
    );
}
