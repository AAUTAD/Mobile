import { z } from "zod"

export const tagSchema = z.object({
    name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
    //color: z.string().min(2, { message: "A cor deve ter pelo menos 2 caracteres." }),
    value: z.string(),
})

export type Tag = z.infer<typeof tagSchema>