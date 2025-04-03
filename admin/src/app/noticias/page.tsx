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
import { NewsForm } from "~/components/news-form";
import { type News } from "~/schemas/news-schema";


export default function NoticiasPage() {
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const { data: news, isLoading } = api.news.getAll.useQuery();

    const utils = api.useUtils();
    const { mutate: deleteMutation } = api.news.delete.useMutation({
        onSuccess: async () => {
            await utils.news.getAll.invalidate();
            toast.success("News deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleDelete = (id: string): void => {
        deleteMutation({ id });
    };

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <div className="flex-1 flex justify-between items-center">
                    <h1 className="text-lg font-semibold">News</h1>
                    <Link href="/noticias/criar">
                        <Button>Add News</Button>
                    </Link>
                </div>
            </header>
            <main className="p-6">
                {isLoading ? (
                    <div>Loading news...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Updated At</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {news?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.title}</TableCell>
                                    <TableCell>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className="h-12 w-12 object-cover" />
                                        ) : (
                                            "No Image"
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{new Date(item.updatedAt).toLocaleString()}</TableCell>
                                    <TableCell>{item.content}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Dialog open={editingNews == item && editOpen} onOpenChange={setEditOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="icon" onClick={() => setEditingNews(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-h-[85vh] scroll-smooth overflow-scroll">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit News</DialogTitle>
                                                    </DialogHeader>
                                                    <NewsForm
                                                        news={editingNews ?? undefined}
                                                        handleSuccess={() => setEditingNews(null)}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDelete(item.id)}
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