"use client";

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { EventForm } from "~/components/event-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// filepath: /Users/joaoazevedo/Documents/Utad/aautad/Mobile/admin/src/app/eventos/criar/page.tsx


export default function CreateEventPage() {
    const router = useRouter();

    const handleSuccess = () => {
        toast.success("Event created successfully!");
        router.push("/eventos");
    };

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Create Event</h1>
            </header>
            <main className="p-6">
                <EventForm handleSuccess={handleSuccess} />
            </main>
        </SidebarInset>
    );
}