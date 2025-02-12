"use client"

import Link from "next/link";
import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Tag } from "~/types/tag";
import { useState } from "react";
import { toast } from "sonner";

export default function TagsPage() {
    const { data: tags, isLoading } = api.tags.getAll.useQuery();
    const [editingTag, setEditingTag] = useState<Tag | null>(null)

    const utils = api.useUtils()
    const { mutate: deleteMutation, isPending: isDeleting } = api.tags.delete.useMutation({
        onSuccess: () => {
            utils.tags.getAll.invalidate()
            toast.success("Tag removida com sucesso")
        },
        onError: (error) => {
            toast.error("Erro ao remover tag")
        }
    })

    const handleDelete = (id: string): void => {
        deleteMutation(id)
    }

    return (
        <SidebarInset>

            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <div className="flex-1 flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Tags</h1>
                    <Link href="/tags/criar"><Button>Adicionar Tag</Button></Link>
                </div>
            </header>
            <main className="p-6">
                <div>
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6">Add/Edit Tag</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tags?.map(tag => (
                                    <TableRow key={tag.id}>
                                        <TableCell>{tag.name}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {/* <Button variant="outline" onClick={() => handleEdit(tag.id)}>Edit</Button> */}
                                                <Button variant="destructive" onClick={() => handleDelete(tag.id)} disabled={isDeleting}>Delete</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

            </main>
        </SidebarInset>
    )
}