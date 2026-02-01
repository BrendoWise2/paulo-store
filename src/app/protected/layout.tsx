import { ReactNode } from "react";
import { getAuthPayload } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
    try {
        await getAuthPayload();
        return children;
    } catch {
        redirect("/login");
    }
}
