"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { NewsSchema, type News } from "~/schemas/news-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { computeSHA256 } from "~/lib/utils";
import { getSignedURL } from "~/lib/aws";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { InstagramIcon, Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";

interface NewsFormProps {
    news?: News;
    handleSuccess?: () => void;
}

export function NewsForm({ news, handleSuccess }: NewsFormProps) {
    const router = useRouter();
    const [file, setFile] = useState<File | undefined>(undefined);
    const [fileUrl, setFileUrl] = useState<string | null | undefined>(news?.imageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [publishToInstagram, setPublishToInstagram] = useState(false);
    const [instagramPreview, setInstagramPreview] = useState(false);
    const [instagramPublishing, setInstagramPublishing] = useState(false);

    const utils = api.useUtils();

    // Check for mobile viewport
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        
        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const createNewsMutation = api.news.create.useMutation({
        onSuccess: async (createdNews) => {
            if (publishToInstagram && createdNews) {
                await handleInstagramPublish(createdNews);
            } else {
                finalizeSubmission();
            }
        },
        onError: (error: unknown) => {
            console.error(error);
            toast.error("Error creating news");
            setIsSubmitting(false);
        },
    });

    const updateNewsMutation = api.news.edit.useMutation({
        onSuccess: async (updatedNews) => {
            if (publishToInstagram && updatedNews) {
                await handleInstagramPublish(updatedNews);
            } else {
                finalizeSubmission();
            }
        },
        onError: (error: unknown) => {
            console.error(error);
            toast.error("Error updating news");
            setIsSubmitting(false);
        },
    });

    // New mutation for Instagram publishing
    const publishToInstagramMutation = api.news.publishToInstagram.useMutation({
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Successfully published to Instagram!");
            } else {
                toast.error(`Failed to publish to Instagram: ${result.error}`);
            }
            finalizeSubmission();
        },
        onError: (error) => {
            console.error("Instagram publishing error:", error);
            toast.error(`Instagram publishing failed: ${error.message}`);
            finalizeSubmission();
        }
    });

    const finalizeSubmission = () => {
        setIsSubmitting(false);
        setInstagramPublishing(false);
        if (utils.news.getAll) {
            void utils.news.getAll.invalidate();
        }
        handleSuccess?.();
        router.push("/noticias");
    };

    const handleInstagramPublish = async (newsItem: any) => {
        try {
            setInstagramPublishing(true);
            
            if (!newsItem?.imageUrl) {
                toast.error("An image is required to publish to Instagram");
                finalizeSubmission();
                return;
            }

            await publishToInstagramMutation.mutateAsync({
                id: newsItem.id,
                title: newsItem.title,
                content: newsItem.content,
                imageUrl: newsItem.imageUrl
            });
        } catch (error) {
            console.error("Error publishing to Instagram:", error);
            toast.error("Failed to publish to Instagram");
            finalizeSubmission();
        }
    };

    const form = useForm<News>({
        resolver: zodResolver(NewsSchema),
        defaultValues: news || {
            title: "",
            content: "",
            type: "main", // Default to main news type
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
        setIsSubmitting(true);
        let imageUrl: string | null | undefined = fileUrl;

        try {
            if (file) {
                const checksum = await computeSHA256(file);
                const signedURLResult = await getSignedURL(file.type, file.size, checksum);

                if (signedURLResult.error) {
                    console.error(signedURLResult.error);
                    setIsSubmitting(false);
                    toast.error("Error uploading image");
                    return;
                }

                if (signedURLResult.success) {
                    imageUrl = signedURLResult.success.url;
                } else {
                    setIsSubmitting(false);
                    toast.error("Failed to get signed URL");
                    return;
                }

                await fetch(imageUrl, {
                    method: "PUT",
                    body: file,
                    headers: {
                        "Content-Type": file.type,
                    },
                });
            }

            if (publishToInstagram && !imageUrl) {
                toast.error("An image is required to publish to Instagram");
                setIsSubmitting(false);
                return;
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
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
            toast.error("An error occurred while submitting the form");
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
                                <Input 
                                    placeholder="News title" 
                                    {...field} 
                                    className="w-full"
                                />
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
                                <Textarea
                                    placeholder="News content"
                                    className="min-h-[200px] resize-y"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>News Type</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select news type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="main">Main News</SelectItem>
                                    <SelectItem value="sports">Sports News</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="space-y-2">
                    <FormLabel>Image</FormLabel>
                    <div className="grid gap-4 md:grid-cols-2 items-center">
                        <div className="flex flex-col gap-2">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm file:border-0 file:bg-transparent file:text-foreground file:font-medium"
                            />
                            <p className="text-xs text-muted-foreground">
                                Recommended size: 1200x630px. Maximum file size: 5MB.
                            </p>
                        </div>
                        {fileUrl && (
                            <div className="mt-2 border rounded-md p-2 flex justify-center">
                                <Image 
                                    src={fileUrl} 
                                    alt="Preview" 
                                    width={200} 
                                    height={150} 
                                    className="h-auto max-h-[150px] w-auto object-contain" 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch 
                            id="instagram-publish" 
                            checked={publishToInstagram}
                            onCheckedChange={setPublishToInstagram}
                        />
                        <label 
                            htmlFor="instagram-publish" 
                            className="flex items-center cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            <InstagramIcon className="h-4 w-4 mr-2" />
                            Publish to Instagram
                        </label>
                    </div>
                    
                    {publishToInstagram && (
                        <div className="border rounded-md p-4 bg-muted/20">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-medium">Instagram Preview</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => setInstagramPreview(!instagramPreview)}
                                >
                                    {instagramPreview ? "Hide Preview" : "Show Preview"}
                                </Button>
                            </div>
                            
                            {instagramPreview && (
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        This is how your post will appear on Instagram
                                    </p>
                                    <div className="border rounded-md bg-white p-3">
                                        <div className="flex items-center mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
                                            <span className="font-medium text-sm">aautad_official</span>
                                        </div>
                                        {fileUrl ? (
                                            <div className="bg-gray-100 aspect-square rounded-md overflow-hidden mb-2">
                                                <Image 
                                                    src={fileUrl} 
                                                    alt="Instagram preview" 
                                                    width={400} 
                                                    height={400}
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-gray-200 aspect-square rounded-md mb-2 flex items-center justify-center">
                                                <p className="text-sm text-gray-500">Please add an image</p>
                                            </div>
                                        )}
                                        <div className="text-sm">
                                            <span className="font-medium">aautad_official</span>{" "}
                                            <span>{form.watch("title")}</span>
                                            <p className="mt-1 text-xs line-clamp-2">{form.watch("content")}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Note: Instagram may crop or resize your image. For best results, use a square image (1:1 ratio).
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <Button 
                    type="submit" 
                    disabled={isSubmitting || instagramPublishing}
                    className="w-full md:w-auto"
                >
                    {(isSubmitting || instagramPublishing) ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {instagramPublishing ? "Publishing to Instagram..." : "Submitting..."}
                        </>
                    ) : news ? "Update" : "Create"}
                </Button>
            </form>
        </Form>
    );
}