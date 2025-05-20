"use client";

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SportForm } from "~/components/sport-form";
import { type Sport } from "~/schemas/sport-schema";
import Image from "next/image";

export default function SportPage() {
    const [editingSport, setEditingSport] = useState<Sport | null>(null);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const { data: sports, isLoading, error } = api.sport.getAll.useQuery();

    const utils = api.useUtils();
    const deleteMutation = api.sport.delete.useMutation({
        onSuccess: async () => {
            await utils.sport.getAll.invalidate();
            toast.success("Sport deleted successfully");
        },
        onError: (error) => {
            toast.error(`Error deleting sport: ${error.message}`);
        },
    });

    const handleDelete = (id: string): void => {
        if (confirm("Are you sure you want to delete this sport?")) {
            deleteMutation.mutate({ id });
        }
    };

    const handleEditSuccess = () => {
        setEditOpen(false);
        setEditingSport(null);
    };

    if (error) {
        return <div>Error loading sports: {error.message}</div>;
    }

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <div className="flex-1 flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Sports</h1>
                    {/* Link to a new page for creating sports */}
                    <Link href="/desporto/criar">
                        <Button>Add Sport</Button>
                    </Link>
                </div>
            </header>
            <main className="p-6">
                {isLoading ? (
                    <div>Loading sports...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Link</TableHead>
                                <TableHead>People</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sports?.map((sport) => (
                                <TableRow key={sport.id}>
                                    <TableCell>{sport.name}</TableCell>
                                    <TableCell>
                                        {sport.imageUrl ? (
                                            <Image src={sport.imageUrl} alt={sport.name} width={48} height={48} className="h-12 w-12 rounded-md object-cover" />
                                        ) : (
                                            "No Image"
                                        )}
                                    </TableCell>
                                    <TableCell>{sport.location}</TableCell>
                                    <TableCell>{sport.details ?? "N/A"}</TableCell>
                                    <TableCell>
                                        {sport.link ? (
                                            <a href={sport.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                                                Visit <ExternalLink className="ml-1 h-4 w-4" />
                                            </a>
                                        ) : (
                                            "N/A"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {sport.persons && sport.persons.length > 0
                                            ? sport.persons.map(person => person.name).join(', ')
                                            : "No people"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Dialog 
                                                open={editingSport?.id === sport.id && editOpen}
                                                onOpenChange={(isOpen) => {
                                                    setEditOpen(isOpen);
                                                    if (!isOpen) {
                                                        setEditingSport(null); // Reset editing state when dialog closes
                                                    }
                                                }}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="icon" onClick={() => {
                                                        setEditingSport(sport);
                                                        setEditOpen(true);
                                                    }}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-h-[85vh] scroll-smooth overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Sport</DialogTitle>
                                                    </DialogHeader>
                                                    <SportForm
                                                        sport={editingSport ?? undefined} // Pass the sport to be edited
                                                        handleSuccess={handleEditSuccess}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => sport.id && handleDelete(sport.id)} // Ensure sport.id is not undefined
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