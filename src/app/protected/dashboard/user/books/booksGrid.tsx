"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.scss";

type Book = {
    id: string;
    title: string;
    description?: string | null;
    pdfUrl: string;
    coverImage?: string | null;
    createdAt: string; // vem como string no JSON
};

export default function BooksClient() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [sort, setSort] = useState<"recent" | "az" | "za">("recent");

    async function load() {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/books/my", { cache: "no-store" });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.message ?? "Erro ao carregar livros");
            setLoading(false);
            return;
        }

        const data = (await res.json()) as Book[];
        setBooks(data);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        let arr = books.filter((b) => {
            if (!term) return true;
            return (
                b.title.toLowerCase().includes(term) ||
                (b.description ?? "").toLowerCase().includes(term)
            );
        });

        if (sort === "recent") {
            arr = arr.sort(
                (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
            );
        } else if (sort === "az") {
            arr = arr.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            arr = arr.sort((a, b) => b.title.localeCompare(a.title));
        }

        return arr;
    }, [books, searchTerm, sort]);

    return (
        <div className={styles.cartilhasPage}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.logo}>
                        Paulo<span className={styles.green}>Treinamento</span>
                    </h1>

                    <div className={styles.nav}>
                        <span>Meus Livros</span>

                        <div className={styles.searchBox}>
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Estou procurando..."
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        <select
                            className={styles.sortSelect}
                            value={sort}
                            onChange={(e) => setSort(e.target.value as any)}
                        >
                            <option value="recent">Mais Recentes</option>
                            <option value="az">Título (A-Z)</option>
                            <option value="za">Título (Z-A)</option>
                        </select>
                    </div>
                </div>
            </header>

            <main className={styles.gridContainer}>
                {loading ? (
                    <p className={styles.emptyText}>Carregando...</p>
                ) : error ? (
                    <p className={styles.emptyText}>{error}</p>
                ) : filtered.length === 0 ? (
                    <p className={styles.emptyText}>Nenhum livro liberado ainda.</p>
                ) : (
                    <div className={styles.grid}>
                        {filtered.map((b, index) => (
                            <a
                                key={b.id}
                                href={b.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.card}
                                style={{ ["--i" as any]: index }}
                            >
                                <div className={styles.imageContainer}>
                                    <img
                                        src={
                                            b.coverImage ||
                                            "https://placehold.co/400x300/EEF0FF/4046A3?text=SEM+CAPA"
                                        }
                                        alt={b.title}
                                        className={styles.cardImage}
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://placehold.co/400x300/EEF0FF/4046A3?text=SEM+CAPA";
                                        }}
                                    />
                                    <div className={styles.shine} />
                                    <div className={styles.overlay}>
                                        <span>Abrir PDF</span>
                                    </div>
                                </div>

                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{b.title}</h3>
                                    {b.description ? (
                                        <p className={styles.cardDesc}>{b.description}</p>
                                    ) : null}
                                    <p className={styles.cardDate}>
                                        Adicionado em:{" "}
                                        {new Date(b.createdAt).toLocaleDateString("pt-BR")}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
