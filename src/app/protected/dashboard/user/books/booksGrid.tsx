"use client";

import styles from "./page.module.scss";

type Book = {
    id: string;
    title: string;
    description: string | null;
    pdfUrl: string;
    coverImage: string | null;
    createdAt: string | Date;
};

const FALLBACK_IMG =
    "https://placehold.co/400x300/e0e8f6/0e414f?text=SEM+CAPA";

export default function BooksGrid({ books }: { books: Book[] }) {
    if (!books?.length) {
        return <p className={styles.emptyText}>Nenhum livro liberado ainda.</p>;
    }

    return (
        <div className={styles.grid}>
            {books.map((b, index) => (
                <div
                    key={b.id}
                    className={styles.card}
                    style={{ ["--i" as any]: index }}
                    onClick={() => window.open(b.pdfUrl, "_blank")}
                    role="button"
                >
                    <div className={styles.imageContainer}>
                        <img
                            src={b.coverImage || FALLBACK_IMG}
                            alt={b.title}
                            className={styles.cardImage}
                            onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMG;
                            }}
                        />
                        <div className={styles.shine} />
                        <div className={styles.overlay}>
                            <span>Abrir PDF</span>
                        </div>
                    </div>

                    <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{b.title}</h3>
                        {b.description && <p className={styles.cardDesc}>{b.description}</p>}
                        <p className={styles.cardDate}>
                            Adicionado em:{" "}
                            {new Date(b.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
