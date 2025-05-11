"use client";

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PersonForm } from "~/components/person-form";
import { type Person } from "~/schemas/person-schema";

export default function PessoasPage() {
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const { data: people, isLoading, error } = api.person.getAll.useQuery();

    const utils = api.useUtils();
    const { mutate: deleteMutation } = api.person.delete.useMutation({
        onSuccess: async () => {
            await utils.person.getAll.invalidate();
            toast.success("Person deleted successfully");
        },
        onError: (error) => {
            toast.error(`Error deleting person: ${error.message}`);
        },
    });

    const handleDelete = (id: string): void => {
        if (confirm("Are you sure you want to delete this person?")) {
            deleteMutation({ id });
        }
    };

    const handleEditSuccess = () => {
        setEditOpen(false);
        setEditingPerson(null);
    };

    if (error) {
        return <div>Error loading people: {error.message}</div>;
    }

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <div className="flex-1 flex justify-between items-center">
                    <h1 className="text-lg font-semibold">People</h1>
                    <Link href="/pessoas/criar">
                        <Button>Add Person</Button>
                    </Link>
                </div>
            </header>
            <main className="p-6">
                {isLoading ? (
                    <div>Loading people...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Sports</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {people?.map((person) => (
                                <TableRow key={person.id}>
                                    <TableCell>{person.name}</TableCell>
                                    <TableCell>{person.contact ?? "N/A"}</TableCell>
                                    <TableCell>{person.email ?? "N/A"}</TableCell>
                                    <TableCell>{person.role}</TableCell>
                                    <TableCell>
                                        {person.sports && person.sports.length > 0
                                            ? person.sports.map(sport => sport.name).join(', ')
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Dialog 
                                                open={editingPerson?.id === person.id && editOpen}
                                                onOpenChange={(isOpen) => {
                                                    setEditOpen(isOpen);
                                                    if (!isOpen) {
                                                        setEditingPerson(null);
                                                    }
                                                }}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="icon" onClick={() => {
                                                        setEditingPerson(person);
                                                        setEditOpen(true);
                                                    }}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-h-[85vh] scroll-smooth overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Person</DialogTitle>
                                                    </DialogHeader>
                                                    <PersonForm
                                                        person={editingPerson ?? undefined}
                                                        handleSuccess={handleEditSuccess}
                                                    />

                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => person.id && handleDelete(person.id)}
                                                disabled={deleteMutation.isPending}
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
