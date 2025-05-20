"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { sportSchema, createSportSchema, updateSportSchema, type Sport } from "~/schemas/sport-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { computeSHA256 } from "~/lib/utils";
import { getSignedURL } from "~/lib/aws";
import MultipleSelector, { type Option } from "./ui/selector";
import { type Person } from "~/schemas/person-schema";

interface SportFormProps {
    sport?: Sport & { persons?: { id: string; name?: string }[] };
    handleSuccess?: () => void;
}

export function SportForm({ sport, handleSuccess }: SportFormProps) {
    const router = useRouter();
    const utils = api.useUtils();

    const [file, setFile] = useState<File | undefined>(undefined);
    const [fileUrl, setFileUrl] = useState<string | null | undefined>(sport?.imageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: personsData, isLoading: isLoadingPersons } = api.person.getAll.useQuery();

    const personOptions: Option[] = personsData?.map(person => ({
        value: person.id,
        label: person.name,
    })) ?? [];

    const form = useForm<Sport>({
        resolver: zodResolver(sport ? updateSportSchema.partial() : createSportSchema),
        defaultValues: sport
            ? {
                ...sport,
                persons: sport.persons?.map(p => ({ id: p.id })) ?? [],
            }
            : {
                name: "",
                location: "",
                details: "",
                link: "",
                imageUrl: undefined,
                persons: [],
            },
    });

    useEffect(() => {
        if (sport) {
            form.reset({
                ...sport,
                persons: sport.persons?.map(p => ({ id: p.id })) ?? [],
            });
            setFileUrl(sport.imageUrl);
        } else {
            form.reset({
                name: "",
                location: "",
                details: "",
                link: "",
                imageUrl: undefined,
                persons: [],
            });
            setFileUrl(undefined);
        }
    }, [sport, form.reset, form]);

    const createSportMutation = api.sport.create.useMutation({
        onSuccess: async () => {
            setIsSubmitting(false);
            await utils.sport.getAll.invalidate();
            toast.success("Sport created successfully!");
            handleSuccess?.();
            router.push("/desporto");
        },
        onError: (error) => {
            setIsSubmitting(false);
            console.error("Error creating sport:", error);
            toast.error(`Error creating sport: ${error.message}`);
        },
    });

    const updateSportMutation = api.sport.update.useMutation({
        onSuccess: async () => {
            setIsSubmitting(false);
            await utils.sport.getAll.invalidate();
            toast.success("Sport updated successfully!");
            handleSuccess?.();
            router.push("/desporto");
        },
        onError: (error) => {
            setIsSubmitting(false);
            console.error("Error updating sport:", error);
            toast.error(`Error updating sport: ${error.message}`);
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setFile(selectedFile);

        if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
        }

        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setFileUrl(url);
            form.setValue("imageUrl", url);
        } else {
            setFileUrl(undefined);
            form.setValue("imageUrl", undefined);
        }
    };

    async function onSubmit(data: Sport) {
        setIsSubmitting(true);
        let finalImageUrl: string | null | undefined = sport?.imageUrl;

        if (file) {
            try {
                const checksum = await computeSHA256(file);
                const signedURLResult = await getSignedURL(file.type, file.size, checksum);

                if (signedURLResult.error) {
                    toast.error(`Failed to get signed URL: ${signedURLResult.error}`);
                    setIsSubmitting(false);
                    return;
                }

                if (signedURLResult.success) {
                    finalImageUrl = signedURLResult.success.url.split("?")[0];
                    await fetch(signedURLResult.success.url, {
                        method: "PUT",
                        body: file,
                        headers: {
                            "Content-Type": file.type,
                        },
                    });
                } else {
                    toast.error("Failed to get signed URL for image upload.");
                    setIsSubmitting(false);
                    return;
                }
            } catch (error) {
                console.error("Error during file upload process:", error);
                toast.error("An error occurred during image upload.");
                setIsSubmitting(false);
                return;
            }
        }

        const submissionData = {
            ...data,
            imageUrl: finalImageUrl,
            persons: data.persons?.map(p => ({ id: p.id })) ?? [],
        };

        if (sport?.id) {
            updateSportMutation.mutate({
                ...submissionData,
                id: sport.id,
            });
        } else {
            createSportMutation.mutate(submissionData);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.error("Form validation errors:", errors);
                toast.error("Please check the form for errors.");
                setIsSubmitting(false); 
            })} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Sport name" {...field} />
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
                                <Input placeholder="Sport location" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Details</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Optional details about the sport" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Link</FormLabel>
                            <FormControl>
                                <Input type="url" placeholder="Optional link (e.g., https://example.com)" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div>
                    <FormLabel>Image</FormLabel>
                    <Input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
                    {fileUrl && (
                        <div className="mt-2">
                            <Image src={fileUrl} alt={form.getValues("name") ?? "Preview"} className="h-20 w-auto rounded-md object-cover" width={80} height={80} />
                        </div>
                    )}
                </div>
                <FormField
                    control={form.control}
                    name="persons"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Persons</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    value={field.value?.map(p => ({ value: p.id, label: personsData?.find(pd => pd.id === p.id)?.name ?? p.id }))}
                                    onChange={(options: Option[]) => field.onChange(options.map(option => ({ id: option.value })))}
                                    options={personOptions}
                                    placeholder="Select persons..."
                                    disabled={isLoadingPersons}
                                    emptyIndicator={<p>No persons found.</p>}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting || createSportMutation.isPending || updateSportMutation.isPending || isLoadingPersons}>
                    {isSubmitting ? "Submitting..." : (sport ? "Update Sport" : "Create Sport")}
                </Button>
            </form>
        </Form>
    );
}