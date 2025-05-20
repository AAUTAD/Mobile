"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { parceiroSchema } from "~/schemas/partners-schema"
import { type Parceiro } from "~/types/parceiro"
import { api } from "~/trpc/react"
import MultipleSelector, { type Option } from "./ui/selector"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { QuillWrapper } from "./ui/react-quill-wrapper"
import 'react-quill/dist/quill.snow.css'

// Photo
import { computeSHA256 } from "~/lib/utils"
import { getSignedURL } from "~/lib/aws"

const OPTIONS: Option[] = [
  { value: "food", label: "Food" },
  { value: "drinks", label: "Drinks" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "services", label: "Services" },
  { value: "health", label: "Health" },
  { value: "beauty", label: "Beauty" },
  { value: "sports", label: "Sports" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
]

interface PartnerFormProps {
  parceiro?: Parceiro; // Optional data for editing
  handleSuccess?: () => void;
}

export function PartnerForm({ parceiro, handleSuccess }: PartnerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<Option[]>([])
  const [isMobile, setIsMobile] = useState(false);

  // Photo
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(parceiro?.nameUrl);

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

  useEffect(() => {
    if (parceiro) {
      setTags(OPTIONS.filter((option) => parceiro.tags.includes(option.value)))
      setFileUrl(parceiro.nameUrl);
    }
  }, [parceiro])

  // Initialize the mutation hook at the top of your component.
  const createPartnerMutation = api.partners.create.useMutation({
    onSuccess: async () => {
      // Handle any post-success actions (e.g., notifications, redirection)
      setIsSubmitting(false);
      toast.success("Parceiro criado com sucesso!")

      // Invalidate the query
      await utils.partners.getAll.invalidate();

      router.push("/parceiros")
    },
    onError: () => {
      setIsSubmitting(false);
      toast.error("Erro ao criar parceiro")
    },
  })

  const editPartnerMutation = api.partners.edit.useMutation({
    onSuccess: async () => {
      setIsSubmitting(false);
      if (handleSuccess) {
        handleSuccess();
      }

      await utils.partners.getAll.invalidate();
      toast.success("Parceiro editado com sucesso!")
      router.push("/parceiros")
    },
    onError: (error) => {
      setIsSubmitting(false);
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
    setIsSubmitting(true);
    let url: string | undefined = undefined;
    
    try {
      const validatedData = parceiroSchema.parse(data);

      // Upload the photo
      if (file) {
        const checksum = await computeSHA256(file);
        const signedURLResult = await getSignedURL(file.type, file.size, checksum);

        if (signedURLResult.error !== undefined) {
          console.error(signedURLResult.error);
          setIsSubmitting(false);
          toast.error("Error uploading image");
          return;
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
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      toast.error("An error occurred while submitting the form");
    }
  }

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
                <Input placeholder="Partner name" {...field} className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <FormLabel>Logo Image</FormLabel>
          <div className="grid gap-4 md:grid-cols-2 items-center">
            <div className="flex flex-col gap-2">
              <input 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm file:border-0 file:bg-transparent file:text-foreground file:font-medium"
              />
              <p className="text-xs text-muted-foreground">
                Upload a logo or image for this partner. Recommended: Square format.
              </p>
            </div>
            {fileUrl && (
              <div className="mt-2 border rounded-md p-2 flex justify-center">
                <Image 
                  src={fileUrl} 
                  alt="Preview" 
                  width={100} 
                  height={100} 
                  className="h-auto max-h-[100px] w-auto object-contain" 
                />
              </div>
            )}
          </div>
        </div>
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
                    placeholder="Partner description"
                    style={{ 
                      height: isMobile ? '200px' : '250px',
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
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount</FormLabel>
              <FormControl>
                <Input placeholder="10% off" {...field} className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input placeholder="40.7128" {...field} value={field.value.toString()} className="w-full" />
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
                  <Input placeholder="-74.0060" {...field} value={field.value.toString()} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Media</h3>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input placeholder="https://facebook.com/partner" {...field} value={field.value ?? ""} className="w-full" />
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
                    <Input placeholder="https://instagram.com/partner" {...field} value={field.value ?? ""} className="w-full" />
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
                    <Input placeholder="https://partner-website.com" {...field} value={field.value ?? ""} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <MultipleSelector
                  defaultOptions={OPTIONS}
                  placeholder="Select categories"
                  emptyIndicator="No categories selected"
                  value={tags}
                  onChange={(value) => { setTags(value) }}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          ) : parceiro ? "Update Partner" : "Create Partner"}
        </Button>
      </form>
    </Form>
  )
}

