import styles from "../company/approvals/page.module.scss";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import PendingTestsCard from "./PendingTestsCard";
import TreinamentosCard from "./TreinamentosCard";
import TestsAvailableCard from "./TestsAvailableCard";
import ProgressCard from "./ProgressCard";
import CertificatesCard from "./CertificatesCard";
import PsyHeader from "./PsyHeader";

export default async function UserDashboardPage() {
    let payload;
    try {
        payload = await requireRole(["USER"]);
    } catch {
        redirect("/login");
    }

    return (
        <div className={styles.page}>
            <PsyHeader name={payload?.name ?? "Usuário"} />
            <main className={styles.container}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
                    <div>
                        <TreinamentosCard />
                        <TestsAvailableCard />
                    </div>

                    <div>
                        <ProgressCard />
                        <CertificatesCard />
                    </div>
                </div>
            </main>
        </div>
    );
}

