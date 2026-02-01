// src/app/protected/dashboard/user/books/page.tsx
import styles from "./page.module.scss";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import BooksGrid from "./booksGrid";

export default async function MyBooksPage() {
    let userId: string;

    try {
        userId = await getAuthUserId();
    } catch {
        redirect("/login");
    }

    const enrollments = await prisma.enrollment.findMany({
        where: { userId, isApproved: true },
        include: { book: true },
        orderBy: { createdAt: "desc" },
    });

    const books = enrollments.map((e) => e.book);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.logo}>Paulo A. B. Pepe</h1>
                    <div className={styles.nav}>
                        <span>Meus Livros</span>
                    </div>
                </div>
            </header>

            <main className={styles.gridContainer}>
                <BooksGrid books={books} />
            </main>
        </div>
    );
}
