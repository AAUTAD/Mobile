"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { NewsSchema, type News } from "~/schemas/news-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { computeSHA256 } from "~/lib/utils";
import { getSignedURL } from "~/lib/aws";


interface NewsFormProps {
    news?: News;
    handleSuccess?: () => void;
}

export function NewsForm({ news, handleSuccess }: NewsFormProps) {
    const router = useRouter();
    const [file, setFile] = useState<File | undefined>(undefined);
    const [fileUrl, setFileUrl] = useState<string | null | undefined>(news?.imageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const utils = api.useUtils();

    const createNewsMutation = api.news.create.useMutation({
        onSuccess: async () => {
            setIsSubmitting(false);
            if (utils.news.getAll) {
                await utils.news.getAll.invalidate();
            }
            toast.success("News created successfully!");
            handleSuccess?.();
            router.push("/noticias");
        },
        onError: (error: unknown) => {
            console.error(error);
            toast.error("Error creating news");
        },
    });

    const updateNewsMutation = api.news.edit.useMutation({
        onSuccess: async () => {
            setIsSubmitting(false);
            if (utils.news.getAll) {
                await utils.news.getAll.invalidate();
            }
            toast.success("News updated successfully!");
            handleSuccess?.();
            router.push("/noticias");
        },
        onError: (error: unknown) => {
            console.error(error);
            toast.error("Error updating news");
        },
    });

    const form = useForm<News>({
        resolver: zodResolver(NewsSchema),
        defaultValues: news || {
            title: "",
            content: "",
            imageUrl: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFile(file);

        if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
        }

        if (file) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);
        } else {
            setFileUrl(undefined);
        }
    };

    async function onSubmit(data: News) {
        let imageUrl: string | null | undefined = fileUrl;

        if (file) {
            const checksum = await computeSHA256(file);
            const signedURLResult = await getSignedURL(file.type, file.size, checksum);

            if (signedURLResult.error) {
                console.error(signedURLResult.error);
                throw new Error(signedURLResult.error);
            }

            if (signedURLResult.success) {
                imageUrl = signedURLResult.success.url;
            } else {
                throw new Error("Failed to get signed URL");
            }

            await fetch(imageUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });
        }

        if (news) {
            updateNewsMutation.mutate({
                id: news.id,
                newsSchema: {
                    ...data,
                    imageUrl: imageUrl ? imageUrl.split("?")[0] : undefined,
                }
            });
        } else {
            createNewsMutation.mutate({
                ...data,
                imageUrl: imageUrl ? imageUrl.split("?")[0] : undefined,
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, error => console.log(error))} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="News title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                                <Textarea placeholder="News content" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div>
                    <FormLabel>Image</FormLabel>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {fileUrl && (
                        <div className="mt-2">
                            <Image src={fileUrl} alt="Preview" className="h-20 w-auto" width={80} height={80} />
                        </div>
                    )}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : news ? "Update" : "Create"}
                </Button>
            </form>
        </Form>
    );
}