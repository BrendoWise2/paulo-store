import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth";
import BooksClient from "./booksGrid";

export default async function MyBooksPage() {
    try {
        await getAuthUserId(); // só valida cookie/token
    } catch {
        redirect("/login");
    }

    return <BooksClient />;
}
