"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { parceiroSchema } from "~/schemas/parceiros-schema"
import { type Parceiro } from "~/types/parceiro"
import { api } from "~/trpc/react"
import MultipleSelector, { type Option } from "./ui/selector"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"

// Photo
import { computeSHA256 } from "~/lib/utils"
import { getSignedURL } from "~/lib/aws"

const OPTIONS: Option[] = [
  { value: "food", label: "Food" },
  { value: "drinks", label: "Drinks" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "services", label: "Services" },
]

interface PartnerFormProps {
  parceiro?: Parceiro; // Optional data for editing
  handleSuccess?: () => void;
}

export function PartnerForm({ parceiro, handleSuccess }: PartnerFormProps) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<Option[]>([])

  // Photo
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

  const utils = api.useUtils();

  useEffect(() => {
    if (parceiro) {
      setTags(OPTIONS.filter((option) => parceiro.tags.includes(option.label)))
    }
  }, [parceiro])

  // Initialize the mutation hook at the top of your component.
  const createPartnerMutation = api.partners.create.useMutation({
    onSuccess:async () => {
      // Handle any post-success actions (e.g., notifications, redirection)
      toast.success("Parceiro criado com sucesso!")

      // Invalidate the query
      await utils.partners.getAll.invalidate();

      router.push("/parceiros")
    },
    onError: () => {
      toast.error("Erro ao criar parceiro")
    },
  })

  const editPartnerMutation = api.partners.edit.useMutation({
    onSuccess: async () => {
      if (handleSuccess) {
        handleSuccess();
      }

      await utils.partners.getAll.invalidate();
      toast.success("Parceiro editado com sucesso!")
      router.push("/parceiros")
    },
    onError: (error) => {
      console.log(error);
      toast.error("Erro ao editar parceiro")
    },
  })

  const form = useForm<Parceiro>({
    resolver: zodResolver(parceiroSchema),
    defaultValues: parceiro ? {
      name: parceiro.name,
      nameUrl: parceiro.nameUrl,
      description: parceiro.description,
      discount: parceiro.discount,
      latitude: parceiro.latitude,
      longitude: parceiro.longitude,
      facebook: parceiro.facebook,
      instagram: parceiro.instagram,
      website: parceiro.website,
      tags: parceiro.tags,
    } : {
      name: "",
      nameUrl: "",
      description: "",
      discount: "",
      latitude: "",
      longitude: "",
      facebook: "",
      instagram: "",
      website: "",
      tags: [],
    },
  })

  async function onSubmit(data: Parceiro) {
    let url: string | undefined = undefined;
    const validatedData = parceiroSchema.parse(data);

    // Upload the photo
    if (file) {
      const checksum = await computeSHA256(file);
      const signedURLResult = await getSignedURL(file.type, file.size, checksum);

      if (signedURLResult.error !== undefined) {
        console.error(signedURLResult.error);
        throw (new Error(signedURLResult.error));
      }

      url = signedURLResult.success.url;

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        }
      })
    }

    if (parceiro?.id) {
      // Edit the partners 
      editPartnerMutation.mutate({
        id: parceiro.id,
        parceiroSchema: {
          ...validatedData,
          nameUrl: url ? url.split('?')[0] : parceiro?.nameUrl,
          latitude: validatedData.latitude.toString(),
          longitude: validatedData.longitude.toString(),
          tags: tags.map((tag) => tag.value),
        },
      });
    } else {
      createPartnerMutation.mutate({
        ...validatedData,
        nameUrl: url?.split('?')[0],
        latitude: validatedData.latitude.toString(),
        longitude: validatedData.longitude.toString(),
        tags: tags.map((tag) => tag.value),
      });
      console.log(tags);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFile(file);

    if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
    }

    console.log(file);
    if (file) {
        const url = URL.createObjectURL(file);
        setFileUrl(url);
    } else {
        setFileUrl(undefined);
    }

    console.log(fileUrl);
}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Partner name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nameUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name URL</FormLabel>
              <FormControl>
                <Input placeholder="Partner name URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {file && (
            <div className="mt-2">
              <Image src={URL.createObjectURL(file)} alt="Preview" className="h-20 w-auto" width={80} height={80} />
            </div>
          )}
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Partner description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount</FormLabel>
              <FormControl>
                <Input placeholder="10% off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input placeholder="40.7128" {...field} value={field.value.toString()} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input placeholder="-74.0060" {...field} value={field.value.toString()} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facebook</FormLabel>
              <FormControl>
                <Input placeholder="https://facebook.com/partner" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram</FormLabel>
              <FormControl>
                <Input placeholder="https://instagram.com/partner" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://partner-website.com" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultipleSelector
                  defaultOptions={OPTIONS}
                  placeholder="Selecionar categorias"
                  emptyIndicator="Nenhuma categoria selecionada"
                  value={tags}
                  onChange={(value) => { setTags(value) }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  )
}

