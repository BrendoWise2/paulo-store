"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./login.module.scss";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.message ?? "Falha no login");
            setLoading(false);
            return;
        }

        router.push("/protected/dashboard");
        router.refresh();
    }

    return (
        <div className={styles.pageContainer}>
            <section className={styles.card}>
                <div className={styles.header}>
                    <h1>Treinamento</h1>
                    <p>Área do aluno</p>
                </div>

                <div className={styles.formContainer}>
                    <h2>Entrar</h2>

                    {error && <p className={styles.error}>{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            className={styles.submitBtn}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
