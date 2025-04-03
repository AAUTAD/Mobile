"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EventSchema, type Event } from "~/schemas/events-schema";
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

interface EventFormProps {
    event?: Event;
    handleSuccess?: () => void;
}

export function EventForm({ event, handleSuccess }: EventFormProps) {
    const router = useRouter();
    const [file, setFile] = useState<File | undefined>(undefined);
    const [fileUrl, setFileUrl] = useState<string | null | undefined>(event?.imageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const utils = api.useUtils();

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
        let imageUrl: string | null | undefined = fileUrl;

        console.log('hello', data)

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
                                <Input placeholder="Event title" {...field} />
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
                                <Textarea placeholder="Event description" {...field} />
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
                                <Input placeholder="Event location" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
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
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
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
                    {isSubmitting ? "Submitting..." : event ? "Update" : "Create"}
                </Button>
            </form>
        </Form>
    );
}
