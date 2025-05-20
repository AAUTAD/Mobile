"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EventSchema, type Event } from "~/schemas/events-schema";
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
import { QuillWrapper } from "~/components/ui/react-quill-wrapper";
import 'react-quill/dist/quill.snow.css';

interface EventFormProps {
    event?: Event;
    handleSuccess?: () => void;
}

export function EventForm({ event, handleSuccess }: EventFormProps) {
    const router = useRouter();
    const [file, setFile] = useState<File | undefined>(undefined);
    const [fileUrl, setFileUrl] = useState<string | null | undefined>(event?.imageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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

    const createEventMutation = api.events.create.useMutation({
        onSuccess: async () => {
            setIsSubmitting(false);
            if (utils.events.getAll) {
                await utils.events.getAll.invalidate();
            }
            toast.success("Event created successfully!");
            handleSuccess?.();
            router.push("/eventos");
        },
        onError: (error: unknown) => {
            console.error(error);
            toast.error("Error creating event");
        },
    });

    const updateEventMutation = api.events.edit.useMutation({
        onSuccess: async () => {
            setIsSubmitting(false);
            if (utils.events.getAll) {
                await utils.events.getAll.invalidate();
            }
            toast.success("Event updated successfully!");
            handleSuccess?.();
            router.push("/eventos");
        },
        onError: (error: unknown) => {
            console.error(error);
            toast.error("Error updating event");
        },
    });

    const form = useForm<Event>({
        resolver: zodResolver(EventSchema),
        defaultValues: event || {
            title: "",
            description: "",
            location: "",
            startDate: new Date(),
            endDate: new Date(),
            imageUrl: undefined,
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

    async function onSubmit(data: Event) {
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

            if (event) {
                updateEventMutation.mutate({
                    ...data,
                    id: event.id,
                    eventSchema: {
                        ...data,
                        imageUrl: imageUrl ? imageUrl.split("?")[0] : undefined,
                    },
                });
            } else {
                createEventMutation.mutate({
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
                                    placeholder="Event title" 
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
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <div className={`border rounded-md ${field.value ? '' : 'border-input'}`}>
                                    <QuillWrapper
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Event description"
                                        style={{ 
                                            height: isMobile ? '200px' : '300px',
                                            marginBottom: '40px'
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Event location" 
                                    {...field} 
                                    className="w-full"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                        className="w-full"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                        className="w-full"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
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
                                Recommended: 1200x630px. Max size: 5MB.
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
                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </>
                    ) : event ? "Update" : "Create"}
                </Button>
            </form>
        </Form>
    );
}
