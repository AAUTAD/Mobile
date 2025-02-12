import { z } from "zod"

export const parceiroSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  nameUrl: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  discount: z.string(),
  latitude: z.string().refine((val) => !isNaN(Number.parseFloat(val)), { message: "Must be a valid number." }),
  longitude: z.string().refine((val) => !isNaN(Number.parseFloat(val)), { message: "Must be a valid number." }),
  facebook: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal("")),
  instagram: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal("")),
  website: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal("")),
  tags: z.array(z.string().min(1, { message: "Tag must be at least 1 character." })),
})

export type Parceiro = z.infer<typeof parceiroSchema>