"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

type ApiError = { message?: string };

export default function NewBookPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const previewSrc = useMemo(() => {
        if (coverFile) return URL.createObjectURL(coverFile);
        return "https://placehold.co/600x400/EEF0FF/4046A3?text=CAPA";
    }, [coverFile]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!pdfFile) {
            setError("Selecione um PDF.");
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("title", title.trim());
            fd.append("description", description.trim());
            fd.append("pdfFile", pdfFile);
            if (coverFile) fd.append("coverFile", coverFile);

            const res = await fetch("/api/books", {
                method: "POST",
                body: fd,
            });

            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as ApiError;
                setError(data.message ?? "Erro ao cadastrar livro");
                return;
            }

            router.push("/protected/dashboard/admin");
        } catch (err: any) {
            setError(err?.message ?? "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>Cadastrar livro</h1>
                        <p className={styles.subtitle}>Envie o PDF e a capa (opcional).</p>
                    </div>

                    <div className={styles.actionsTop}>
                        <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={() => router.push("/protected/dashboard/admin")}
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.container}>
                <div className={styles.grid}>
                    <section className={styles.previewCard}>
                        <div className={styles.previewHead}>
                            <div className={styles.previewTitle}>Prévia da capa</div>
                            <div className={styles.previewHint}>Upload de imagem</div>
                        </div>

                        <div className={styles.previewFrame}>
                            <img
                                src={previewSrc}
                                alt="Prévia da capa"
                                className={styles.previewImg}
                            />
                        </div>

                        <div className={styles.previewMeta}>
                            <div className={styles.previewMetaLabel}>Título</div>
                            <div className={styles.previewMetaValue}>{title || "—"}</div>

                            <div className={styles.previewMetaLabel}>PDF</div>
                            <div className={styles.previewMetaValue}>
                                {pdfFile ? pdfFile.name : "—"}
                            </div>
                        </div>
                    </section>

                    <section className={styles.formCard}>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Título *</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Descrição (opcional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>PDF *</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Capa (opcional)</label>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                                />
                            </div>

                            {error && <div className={styles.errorBox}>{error}</div>}

                            <div className={styles.formActions}>
                                <button className={styles.btnPrimary} disabled={loading}>
                                    {loading ? "Salvando..." : "Cadastrar"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}
