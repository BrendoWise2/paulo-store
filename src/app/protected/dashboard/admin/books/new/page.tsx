"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

type ApiError = { message?: string };

export default function NewBookPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const previewSrc = useMemo(() => {
        const url = coverImage.trim();
        if (!url) return "https://placehold.co/600x400/EEF0FF/4046A3?text=CAPA";
        return url;
    }, [coverImage]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    pdfUrl: pdfUrl.trim(),
                    description: description.trim() ? description.trim() : null,
                    coverImage: coverImage.trim() ? coverImage.trim() : null,
                }),
            });

            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as ApiError;
                setError(data.message ?? "Erro ao cadastrar livro");
                setLoading(false);
                return;
            }

            // sucesso
            router.push("/protected/dashboard/admin");
            // ou router.push("/protected/dashboard/admin/books"); quando existir listagem
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
                        <p className={styles.subtitle}>Crie um novo livro e informe as URLs do PDF e da capa.</p>
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
                    {/* Preview */}
                    <section className={styles.previewCard}>
                        <div className={styles.previewHead}>
                            <div className={styles.previewTitle}>Prévia da capa</div>
                            <div className={styles.previewHint}>Cole a URL da imagem</div>
                        </div>

                        <div className={styles.previewFrame}>
                            <img
                                src={previewSrc}
                                alt="Prévia da capa"
                                className={styles.previewImg}
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "https://placehold.co/600x400/EEF0FF/4046A3?text=CAPA";
                                }}
                            />
                        </div>

                        <div className={styles.previewMeta}>
                            <div className={styles.previewMetaLabel}>Título</div>
                            <div className={styles.previewMetaValue}>{title || "—"}</div>

                            <div className={styles.previewMetaLabel}>PDF</div>
                            <div className={styles.previewMetaValue}>
                                {pdfUrl ? (
                                    <a href={pdfUrl} target="_blank" rel="noreferrer">
                                        Abrir PDF
                                    </a>
                                ) : (
                                    "—"
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Form */}
                    <section className={styles.formCard}>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Título *</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex.: Treinamento de Saúde Mental"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>URL do PDF *</label>
                                <input
                                    value={pdfUrl}
                                    onChange={(e) => setPdfUrl(e.target.value)}
                                    placeholder="https://..."
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>URL da capa (opcional)</label>
                                <input
                                    value={coverImage}
                                    onChange={(e) => setCoverImage(e.target.value)}
                                    placeholder="https://... (jpg/png)"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Descrição (opcional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Resumo do conteúdo do livro..."
                                    rows={5}
                                />
                            </div>

                            {error && <div className={styles.errorBox}>{error}</div>}

                            <div className={styles.formActions}>
                                <button className={styles.btnPrimary} disabled={loading}>
                                    {loading ? "Salvando..." : "Cadastrar"}
                                </button>

                                {/* opcional: testar capa/pdf */}
                                <button
                                    type="button"
                                    className={styles.btnGhost}
                                    onClick={() => {
                                        if (pdfUrl.trim()) window.open(pdfUrl.trim(), "_blank");
                                    }}
                                    disabled={!pdfUrl.trim()}
                                >
                                    Testar PDF
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}
