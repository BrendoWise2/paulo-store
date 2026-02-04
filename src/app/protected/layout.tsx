import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
    try {
        await requireRole(["COMPANY_ADMIN"]);
    } catch {
        redirect("/login");
    }
    return <>{children}</>;
}
