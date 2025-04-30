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
import { DesportoForm } from "~/components/DesportoForm";
import { type Desporto } from "~/schemas/desporto";

export interface DesportoFormProps {
    desporto?: Desporto; // Ensure desporto is optional and can be undefined
    handleSuccess: () => void;
    // other props
}

export default function DesportoPage({desporto, handleSuccess}: DesportoFormProps) {
    const [editingDesporto, setEditingDesporto] = useState<Desporto | null>(desporto ?? null);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const { data: desportos, isLoading } = api.desporto.getAll.useQuery();

    const utils = api.useUtils();
    const { mutate: deleteMutation } = api.desporto.delete.useMutation({
        onSuccess: async () => {
            await utils.desporto.getAll.invalidate();
            toast.success("Desporto deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    // const handleDelete = (id: string): void => {
    //     deleteMutation(id);
    // };

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <div className="flex-1 flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Desporto</h1>
                    <Link href="/desporto/criar">
                        <Button>Add Desporto</Button>
                    </Link>
                </div>
            </header>
            <main className="p-6">
                {isLoading ? (
                    <div>Loading desportos...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {desportos?.map((desporto) => (
                                <TableRow key={desporto.id}>
                                    <TableCell>{desporto.name}</TableCell>
                                    <TableCell>{desporto.type}</TableCell>
                                    <TableCell>
                                        {desporto.imageUrl ? (
                                            <img src={desporto.imageUrl} alt={desporto.name} className="h-10" />
                                        ) : (
                                            "N/A"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Dialog open={editingDesporto == desporto && editOpen} onOpenChange={setEditOpen}>
                                                <DialogTrigger asChild>
                                                    {/* <Button variant="outline" size="icon" onClick={() => setEditingDesporto(desporto)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button> */}
                                                </DialogTrigger>
                                                <DialogContent className="max-h-[85vh] scroll-smooth overflow-scroll">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Desporto</DialogTitle>
                                                    </DialogHeader>
                                                    <DesportoForm
                                                        handleSuccess={() => {
                                                            setEditOpen(false);
                                                            handleSuccess();
                                                        }}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            {/* <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDelete(desporto.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button> */}
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