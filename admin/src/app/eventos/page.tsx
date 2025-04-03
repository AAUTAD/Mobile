"use client"

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EventForm } from "~/components/event-form";
import { type Event } from "~/schemas/events-schema";


export default function EventosPage() {
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const { data: events, isLoading } = api.events.getAll.useQuery();

    const utils = api.useUtils();
    const { mutate: deleteMutation } = api.events.delete.useMutation({
        onSuccess: async () => {
            await utils.events.getAll.invalidate();
            toast.success("Event deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleDelete = (id: string): void => {
        deleteMutation(id);
    };

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <div className="flex-1 flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Events</h1>
                    <Link href="/eventos/criar">
                        <Button>Add Event</Button>
                    </Link>
                </div>
            </header>
            <main className="p-6">
                {isLoading ? (
                    <div>Loading events...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events?.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell>{event.title}</TableCell>
                                    <TableCell>{event.description}</TableCell>
                                    <TableCell>{event.location}</TableCell>
                                    <TableCell>{new Date(event.startDate).toLocaleString()}</TableCell>
                                    <TableCell>{new Date(event.endDate).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Dialog open={editingEvent == event && editOpen} onOpenChange={setEditOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="icon" onClick={() => setEditingEvent(event)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-h-[85vh] scroll-smooth overflow-scroll">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Event</DialogTitle>
                                                    </DialogHeader>
                                                    <EventForm
                                                        event={editingEvent ?? undefined}
                                                        handleSuccess={() => setEditingEvent(null)}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDelete(event.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </main>
        </SidebarInset>
    );
}