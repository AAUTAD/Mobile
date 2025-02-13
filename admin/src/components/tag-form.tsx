"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { type Tag } from "@prisma/client"
import { useForm } from "react-hook-form"
import { tagSchema } from "~/schemas/tag-schema";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TagFormProps {
    tag?: Tag; // Optional data for editing
}

export function TagForm({ tag }: TagFormProps) {
    const router = useRouter();

    const getValue = (name: string) => {
        // make it small letters, replace spaces with dashes and remove special characters
        return name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    }

    const utils = api.useUtils();

    const editTagMutation = api.tags.edit.useMutation({
        onSuccess: async () => {
          await utils.tags.getAll.invalidate();
          toast.success("Tag editada com sucesso!")
          router.push("/tags")
        },
        onError: (error) => {
          console.log(error);
          toast.error("Erro ao editar tag")
        },
      })

    const createTagMutation = api.tags.create.useMutation({
        onSuccess: async () => {
          await utils.tags.getAll.invalidate();
          toast.success("Tag criada com sucesso!")
          router.push("/tags")
        },
        onError: (error) => {
          console.log(error);
          toast.error("Erro ao criar tag")
        },
      })
    

    const form = useForm<Tag>({
        resolver: zodResolver(tagSchema),
        defaultValues: tag || {
            name: "",
            value: "",
        }
    })

    async function onSubmit(data: Tag){
        const validatedData = tagSchema.parse(data);

        if(tag?.id) {
            editTagMutation.mutate({
                id: tag.id,
                tagSchema: {
                    ...validatedData,
                    name: data.name,
                    value: getValue(data.name)
                }
            })
        } else {
            createTagMutation.mutate({
                ...validatedData,
                name: data.name,
                value: getValue(data.name)
            })
        }
    }

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                                <Input {...field} type="text" placeholder="Nome" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="btn">Guardar</Button>
            </form>
        </Form>
    )
}