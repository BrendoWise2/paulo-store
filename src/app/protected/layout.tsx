import { redirect } from "next/navigation";
import { getAuthPayload } from "@/lib/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
    try {
        await getAuthPayload(); // apenas verifica autenticação, não papel
    } catch {
        redirect("/login");
    }
    return <>{children}</>;
}
