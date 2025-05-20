"use client";

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { SportForm } from "~/components/sport-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


export default function CreateSportPage() {
    const router = useRouter();

    const handleSuccess = () => {
        toast.success("Sport created successfully!");
        router.push("/desporto");
    };

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Create Sport</h1>
            </header>
            <main className="p-6">
                <SportForm handleSuccess={handleSuccess} />
            </main>
        </SidebarInset>
    );
}
