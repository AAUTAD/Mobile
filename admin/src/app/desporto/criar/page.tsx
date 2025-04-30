"use client";

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { DesportoForm } from "~/components/DesportoForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateDesportoPage() {
    const router = useRouter();

    const handleSuccess = () => {
        toast.success("Desporto created successfully!");
        router.push("/desporto");
    };

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Create Desporto</h1>
            </header>
            <main className="p-6">
                <DesportoForm handleSuccess={handleSuccess} />
            </main>
        </SidebarInset>
    );
}