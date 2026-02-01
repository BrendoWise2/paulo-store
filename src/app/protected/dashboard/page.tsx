import { redirect } from "next/navigation";
import { getAuthPayload } from "@/lib/auth";

export default async function DashboardRoot() {
    const payload = await getAuthPayload();

    if (payload.role === "SUPER_ADMIN") redirect("/protected/dashboard/admin");
    if (payload.role === "COMPANY_ADMIN") redirect("/protected/dashboard/company");

    redirect("/protected/dashboard/user");
}
