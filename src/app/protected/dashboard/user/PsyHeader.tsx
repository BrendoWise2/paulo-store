import styles from "../company/approvals/page.module.scss";
import Link from "next/link";

export default function PsyHeader({ name }: { name: string }) {
    return (
        <header className={styles.header} style={{ background: "#f8f7fa", borderBottom: "1.5px solid #e0e0ef" }}>
            <div style={{
                maxWidth: 1100,
                margin: "0 auto",
                padding: "2.2rem 2.2rem 1.2rem 2.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 32,
            }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <span style={{ fontWeight: 700, color: "#6F79D8", fontSize: 18, letterSpacing: 0.2 }}>Bem-vindo, {name}!</span>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#40406a", letterSpacing: -1 }}>Painel do Usuário</h1>
                    <span style={{ color: "#8b8fae", fontSize: 15, marginTop: 2 }}>Acompanhe seus treinamentos, testes e certificados</span>
                </div>
                <nav style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <Link href="/help" title="Ajuda" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, background: "#f2f2fa", border: "1px solid #e0e0ef", color: "#6F79D8", boxShadow: "0 2px 8px #e0e0ef33", transition: "background .15s" }}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 19.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm0-4.5c-.41 0-.75-.34-.75-.75v-.38c0-1.02.62-1.58 1.23-2.13.6-.54 1.02-.92 1.02-1.62 0-.89-.72-1.61-1.6-1.61-.89 0-1.6.72-1.6 1.61 0 .41-.34.75-.75.75s-.75-.34-.75-.75c0-1.74 1.41-3.11 3.1-3.11 1.7 0 3.1 1.37 3.1 3.11 0 1.41-.91 2.2-1.62 2.81-.54.48-.63.57-.63 1.06v.38c0 .41-.34.75-.75.75Z" fill="currentColor" /></svg>
                    </Link>
                    <Link href="/protected/settings" title="Configurações" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, background: "#f2f2fa", border: "1px solid #e0e0ef", color: "#6F79D8", boxShadow: "0 2px 8px #e0e0ef33", transition: "background .15s" }}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm7.43-2.06c.07-.41.07-.85 0-1.28l1.54-1.2a.75.75 0 0 0 .18-.97l-1.46-2.53a.75.75 0 0 0-.93-.34l-1.81.73a7.03 7.03 0 0 0-1.1-.64l-.27-1.93A.75.75 0 0 0 14.87 4h-2.92a.75.75 0 0 0-.74.62l-.27 1.93c-.38.17-.75.36-1.1.58l-1.81-.73a.75.75 0 0 0-.93.34l-1.46 2.53a.75.75 0 0 0 .18.97l1.54 1.2c-.03.21-.05.43-.05.65 0 .22.02.44.05.65l-1.54 1.2a.75.75 0 0 0-.18.97l1.46 2.53c.2.35.62.48.97.34l1.81-.73c.35.23.72.44 1.1.62l.27 1.93c.07.41.41.7.74.7h2.92c.37 0 .7-.29.74-.7l.27-1.93c.38-.18.75-.39 1.1-.62l1.81.73c.35.14.77.01.97-.34l1.46-2.53a.75.75 0 0 0-.18-.97l-1.54-1.2ZM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" fill="currentColor" /></svg>
                    </Link>
                    <a href="/api/auth/logout" title="Sair" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, background: "#f2f2fa", border: "1px solid #e0e0ef", color: "#e74b5a", boxShadow: "0 2px 8px #e0e0ef33", transition: "background .15s" }}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M16.75 12c0-.41-.34-.75-.75-.75H9.81l1.72-1.72a.75.75 0 1 0-1.06-1.06l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06L9.81 12.75h6.19c.41 0 .75-.34.75-.75ZM19.25 4.75v14.5c0 .41-.34.75-.75.75H7.75a.75.75 0 0 1 0-1.5h10V5.5h-10a.75.75 0 0 1 0-1.5h10.75c.41 0 .75.34.75.75Z" fill="currentColor" /></svg>
                    </a>
                </nav>
            </div>
        </header>
    );
}
