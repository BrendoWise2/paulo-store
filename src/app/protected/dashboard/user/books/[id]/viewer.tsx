"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import styles from "./viewer.module.scss";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type Props = {
    bookId: string;
    title: string;
};

export default function BookViewer({ bookId, title }: Props) {
    const [page, setPage] = useState(1);
    const [pageInput, setPageInput] = useState("1");
    const [zoom, setZoom] = useState(1);
    const [pagesTotal, setPagesTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [iframeMode, setIframeMode] = useState(false);
    const [iframeReload, setIframeReload] = useState(0);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const iframePageLockRef = useRef(false);
    const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const pdfUrl = useMemo(() => `/api/books/${bookId}/pdf`, [bookId]);

    useEffect(() => {
        function onContextMenu(e: MouseEvent) {
            e.preventDefault();
        }

        function onKeyDown(e: KeyboardEvent) {
            const key = e.key.toLowerCase();
            if ((e.ctrlKey || e.metaKey) && (key === "s" || key === "p")) {
                e.preventDefault();
            }
        }

        document.addEventListener("contextmenu", onContextMenu);
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("contextmenu", onContextMenu);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    useEffect(() => {
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        return () => {
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
        };
    }, []);

    useEffect(() => {
        let active = true;

        async function loadPdfData() {
            try {
                setIsLoading(true);
                setPdfError(null);
                setPdfData(null);
                setIframeMode(false);
                setPagesTotal(0);
                setPage(1);
                setPageInput("1");

                const res = await fetch(pdfUrl, {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error(`Erro ao carregar PDF (${res.status})`);
                }

                const buf = await res.arrayBuffer();
                if (!active) return;
                const data = new Uint8Array(buf);
                setPdfData(data);

                // fallback: estimate total pages directly from PDF bytes
                const text = new TextDecoder("latin1").decode(data);
                const matches = text.match(/\/Type\s*\/Page\b/g);
                const estimatedTotal = matches?.length ?? 0;
                if (estimatedTotal > 0) {
                    setPagesTotal(estimatedTotal);
                }
            } catch {
                if (!active) return;
                setPdfError("Nao foi possivel carregar este PDF.");
                setIsLoading(false);
                setIframeMode(true);
            }
        }

        loadPdfData();

        return () => {
            active = false;
        };
    }, [pdfUrl]);

    useEffect(() => {
        setPageInput(String(page));
    }, [page]);

    useEffect(() => {
        if (!pagesTotal || !scrollRef.current) return;

        observerRef.current?.disconnect();
        const root = scrollRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                let bestPage = page;
                let bestRatio = 0;

                for (const entry of entries) {
                    const p = Number((entry.target as HTMLElement).dataset.page || "0");
                    if (entry.intersectionRatio > bestRatio) {
                        bestRatio = entry.intersectionRatio;
                        bestPage = p;
                    }
                }

                if (bestRatio > 0.2 && bestPage !== page) {
                    setPage(bestPage);
                }
            },
            {
                root,
                threshold: [0.2, 0.4, 0.6, 0.8],
            }
        );

        observerRef.current = observer;

        pageRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => {
            observer.disconnect();
        };
    }, [pagesTotal, page]);

    function scrollToPage(targetPage: number) {
        const next = Math.max(1, Math.min(pagesTotal || 1, targetPage));

        if (iframeMode) {
            setPage(next);
            setIframeReload((n) => n + 1);
            return;
        }

        const el = pageRefs.current[next - 1];

        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setPage(next);
        }
    }

    function goPrev() {
        scrollToPage(page - 1);
    }

    function goNext() {
        scrollToPage(page + 1);
    }

    function applyPageInput() {
        const parsed = Number(pageInput);
        if (!Number.isFinite(parsed)) return;
        scrollToPage(Math.trunc(parsed));
    }

    const syncIframeScrollPosition = useCallback((targetPage: number) => {
        const el = scrollRef.current;
        if (!el || !pagesTotal) return;
        const max = Math.max(1, pagesTotal);
        const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
        const ratio = max <= 1 ? 0 : (targetPage - 1) / (max - 1);
        el.scrollTop = maxScroll * ratio;
    }, [pagesTotal]);

    useEffect(() => {
        if (!iframeMode) return;
        syncIframeScrollPosition(page);
    }, [iframeMode, page, pagesTotal, syncIframeScrollPosition]);

    useEffect(() => {
        if (!iframeMode) return;
        const el = scrollRef.current;
        if (!el) return;

        function onScroll() {
            if (iframePageLockRef.current) return;
            if (!pagesTotal) return;

            const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
            const ratio = el.scrollTop / maxScroll;
            const nextPage = Math.max(1, Math.min(pagesTotal, Math.round(ratio * (pagesTotal - 1)) + 1));

            if (nextPage !== page) {
                iframePageLockRef.current = true;
                setPage(nextPage);
                setIframeReload((n) => n + 1);
                window.setTimeout(() => {
                    iframePageLockRef.current = false;
                }, 180);
            }
        }

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            el.removeEventListener("scroll", onScroll);
        };
    }, [iframeMode, page, pagesTotal]);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/protected/dashboard/user/books" className={styles.backLink}>
                        Voltar para livros
                    </Link>
                    <div className={styles.meta}>
                        <h1 className={styles.title}>{title}</h1>
                        <p className={styles.subtitle}>Leitura online protegida</p>
                    </div>
                </div>
            </header>

            <section className={styles.toolbar}>
                <div className={styles.group}>
                    <button type="button" className={styles.btn} onClick={goPrev}>
                        Pagina anterior
                    </button>

                    <div className={styles.pageBox}>
                        <span>Pagina</span>
                        <input
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onBlur={applyPageInput}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    applyPageInput();
                                }
                            }}
                        />
                        <span>de {pagesTotal || "--"}</span>
                    </div>

                    <button type="button" className={styles.btn} onClick={goNext}>
                        Proxima pagina
                    </button>
                </div>

                <div className={styles.group}>
                    <label className={styles.zoomBox}>
                        Escala
                        <select
                            value={zoom}
                            onChange={(e) => {
                                setZoom(Number(e.target.value));
                                if (iframeMode) {
                                    setIframeReload((n) => n + 1);
                                }
                            }}
                        >
                            <option value={0.75}>75%</option>
                            <option value={0.9}>90%</option>
                            <option value={1}>100%</option>
                            <option value={1.25}>125%</option>
                            <option value={1.5}>150%</option>
                            <option value={2}>200%</option>
                        </select>
                    </label>

                    <button
                        type="button"
                        className={styles.btnGhost}
                        onClick={() => {
                            setZoom(1);
                            scrollToPage(1);
                            if (iframeMode) {
                                setIframeReload((n) => n + 1);
                            }
                        }}
                    >
                        Resetar visualizacao
                    </button>
                </div>
            </section>

            <main className={styles.viewerWrap}>
                {isLoading ? <div className={styles.loading}>Carregando documento...</div> : null}

                <div
                    className={`${styles.scrollArea} ${iframeMode ? styles.scrollAreaIframe : ""}`}
                    ref={scrollRef}
                >
                    {iframeMode ? (
                        <div className={styles.compatWrap}>
                        <iframe
                            title={`Leitor de ${title} (compatibilidade)`}
                            className={styles.compatViewer}
                            scrolling="no"
                            src={`/api/books/${bookId}/pdf?v=${iframeReload}#toolbar=0&navpanes=0&scrollbar=0&page=${page}&zoom=${Math.round(zoom * 100)}`}
                        />
                            <div
                                className={styles.compatScrollSpace}
                                style={{ height: `${Math.max(1, pagesTotal) * 70}vh` }}
                            />
                        </div>
                    ) : pdfData ? (
                        <Document
                            key={bookId}
                            file={{ data: pdfData }}
                            loading={null}
                            onLoadSuccess={({ numPages }) => {
                                setPagesTotal(numPages);
                                pageRefs.current = Array.from({ length: numPages }, () => null);
                                setIsLoading(false);
                            }}
                            onLoadError={() => {
                                setPdfError("Nao foi possivel renderizar este PDF.");
                                setIsLoading(false);
                                setIframeMode(true);
                            }}
                        >
                            {Array.from({ length: pagesTotal }, (_, i) => {
                                const pageNumber = i + 1;
                                return (
                                    <div
                                        key={pageNumber}
                                        data-page={pageNumber}
                                        ref={(el) => {
                                            pageRefs.current[i] = el;
                                        }}
                                        className={styles.pageFrame}
                                    >
                                        <Page
                                            pageNumber={pageNumber}
                                            scale={zoom}
                                            renderAnnotationLayer={false}
                                            renderTextLayer={false}
                                        />
                                    </div>
                                );
                            })}
                        </Document>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
