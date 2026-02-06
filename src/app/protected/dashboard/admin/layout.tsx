import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
    try {
        await requireRole(["SUPER_ADMIN"]);
    } catch {
        redirect("/login");
    }

    return <>{children}</>;
}
