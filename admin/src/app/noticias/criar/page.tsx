"use client";

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { NewsForm } from "~/components/news-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


export default function CreateNewsPage() {
    const router = useRouter();

    const handleSuccess = () => {
        toast.success("News created successfully!");
        router.push("/noticias");
    };

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Create News</h1>
            </header>
            <main className="p-6">
                <NewsForm handleSuccess={handleSuccess} />
            </main>
        </SidebarInset>
    );
}