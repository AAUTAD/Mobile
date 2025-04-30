"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { desportoSchema, type Desporto } from "~/schemas/desporto";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";
import { computeSHA256 } from "~/lib/utils";
import { getSignedURL } from "~/lib/aws";

interface DesportoFormProps {
  desporto?: Desporto;
  handleSuccess?: () => void;
}

export function DesportoForm({ desporto, handleSuccess }: DesportoFormProps) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(desporto?.imageUrl);

  const utils = api.useUtils();
  

  const createDesportoMutation = api.desporto.create.useMutation({
    onSuccess: async () => {
      await utils.desporto.getAll.invalidate();
      toast.success("Desporto created successfully!");
      handleSuccess?.();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error creating desporto");
    },
  });

//   const updateDesportoMutation = api.desporto.edit.useMutation({
//     onSuccess: async () => {
//       await utils.desporto.getAll.invalidate();
//       toast.success("Desporto updated successfully!");
//       handleSuccess?.();
//     },
//     onError: (error) => {
//       console.error(error);
//       toast.error("Error updating desporto");
//     },
//   });

  const form = useForm<Desporto>({
    resolver: zodResolver(desportoSchema),
    defaultValues: desporto || {
      name: "",
      type: "",
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

  async function onSubmit(data: Desporto) {
    
    let imageUrl: string | undefined = undefined;

    if (file) {
      const checksum = await computeSHA256(file);
      const signedURLResult = await getSignedURL(file.type, file.size, checksum);

      if (signedURLResult.error) {
        console.error(signedURLResult.error);
        throw new Error(signedURLResult.error);
      }

      imageUrl = "";

      await fetch(imageUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
    }

    // if (desporto?.id) {
    //   updateDesportoMutation.mutate({
    //     ...data,
    //     imageUrl: imageUrl || desporto.imageUrl,
    //   });
    // } else {
    //}
    createDesportoMutation.mutate({
      ...data,
      imageUrl,
    });
}

  return (
    <Form {...form}>
      <form  onSubmit={form.handleSubmit(onSubmit, error => console.log(error))} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Desporto name" {...field} />
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
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input placeholder="Desporto type" {...field} />
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
        <Button type="submit" className="w-full" >
          {desporto ? "Update Desporto" : "Create Desporto"}
        </Button>
      </form>
    </Form>
  );
}