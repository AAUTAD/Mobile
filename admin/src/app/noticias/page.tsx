"use client";

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { api } from "~/trpc/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "~/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "~/components/ui/dialog";
import { Pencil, Trash2, Search, CalendarIcon, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NewsForm } from "~/components/news-form";
import { type News } from "~/schemas/news-schema";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "~/components/ui/tooltip";

export default function NoticiasPage() {
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [viewContent, setViewContent] = useState<News | null>(null);
    const [viewContentOpen, setViewContentOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

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

    const handleDelete = (id: string) => {
        deleteMutation({ id });
    };

    const filteredNews = news?.filter(item => {
        const matchesSearch =
            searchQuery === '' ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDate =
            !dateFilter ||
            new Date(item.createdAt).toDateString() === dateFilter.toDateString();

        const matchesType = !typeFilter || item.type === typeFilter;

        return matchesSearch && matchesDate && matchesType;
    });

    const truncateText = (text: string, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const resetFilters = () => {
        setSearchQuery('');
        setDateFilter(undefined);
        setTypeFilter(undefined);
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

            <div className="p-6 pb-2 flex flex-wrap gap-4 border-b">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search news..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "justify-start text-left font-normal w-[240px]",
                                !dateFilter && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={dateFilter}
                            onSelect={setDateFilter}
                        />
                    </PopoverContent>
                </Popover>

                <select
                    className="h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={typeFilter || ""}
                    onChange={(e) => setTypeFilter(e.target.value || undefined)}
                >
                    <option value="">All News Types</option>
                    <option value="main">Main News</option>
                    <option value="sports">Sports News</option>
                </select>

                {(searchQuery || dateFilter || typeFilter) && (
                    <Button variant="ghost" onClick={resetFilters}>
                        Clear filters
                    </Button>
                )}
            </div>

            <main className="p-6">
                {isLoading ? (
                    <div>Loading news...</div>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Showing {filteredNews?.length || 0} of {news?.length || 0} news items
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>{/*
                                    */}<TableHead>Image</TableHead>{/*
                                    */}<TableHead>Type</TableHead>{/*
                                    */}<TableHead>Created At</TableHead>{/*
                                    */}<TableHead>Content</TableHead>{/*
                                    */}<TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredNews?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.title}</TableCell>{/*
                                        */}<TableCell>
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.title} className="h-12 w-12 object-cover rounded-md" />
                                            ) : (
                                                "No Image"
                                            )}
                                        </TableCell>{/*
                                        */}<TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'sports' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {item.type === 'sports' ? 'Sports' : 'Main'}
                                            </span>
                                        </TableCell>{/*
                                        */}<TableCell className="whitespace-nowrap">
                                            {format(new Date(item.createdAt), "PPP")}
                                        </TableCell>{/*
                                        */}<TableCell className="max-w-[200px]">
                                            <div className="line-clamp-2 text-sm">
                                                {truncateText(item.content)}
                                            </div>
                                        </TableCell>{/*
                                        */}<TableCell>
                                            <div className="flex space-x-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => {
                                                                    // Cast the item to ensure type property is correctly typed as "main" | "sports"
                                                                    const typedItem = {
                                                                      ...item,
                                                                      type: item.type as "main" | "sports"
                                                                    };
                                                                    setViewContent(typedItem);
                                                                    setViewContentOpen(true);
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>View full content</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>{/*
                                                */}<Dialog open={editingNews == item && editOpen} onOpenChange={setEditOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="icon" onClick={() => {
                                                            // Cast the item to ensure type property is correctly typed as "main" | "sports"
                                                            const typedItem = {
                                                                ...item,
                                                                type: item.type as "main" | "sports"
                                                            };
                                                            setEditingNews(typedItem);
                                                        }}>
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
                                                </Dialog>{/*
                                                */}<TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleDelete(item.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                )}
            </main>

            <Dialog open={viewContentOpen} onOpenChange={setViewContentOpen}>
                <DialogContent className="max-h-[85vh] scroll-smooth overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{viewContent?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        {viewContent?.imageUrl && (
                            <div className="flex justify-center">
                                <img
                                    src={viewContent.imageUrl}
                                    alt={viewContent.title}
                                    className="max-h-[300px] object-contain rounded-md"
                                />
                            </div>
                        )}
                        <div className="text-sm text-muted-foreground flex items-center gap-3">
                            <div>Created: {viewContent && format(new Date(viewContent.createdAt), "PPP p")}</div>
                            {viewContent?.type && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewContent.type === 'sports' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                    {viewContent.type === 'sports' ? 'Sports' : 'Main'}
                                </span>
                            )}
                        </div>
                        <div className="whitespace-pre-wrap">{viewContent?.content || ''}</div>
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarInset>
    );
}
