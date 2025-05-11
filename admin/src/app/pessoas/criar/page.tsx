"use client";

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { PersonForm } from "~/components/person-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CriarPessoaPage() {
    const router = useRouter();

    const handleSuccess = () => {
        toast.success("Person created successfully!");
        router.push("/pessoas");
    };

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Create Person</h1>
            </header>
            <main className="p-6">
                <PersonForm handleSuccess={handleSuccess} />
            </main>
        </SidebarInset>
    );
}
