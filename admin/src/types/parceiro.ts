import { Decimal } from "@prisma/client/runtime/library"

export type Parceiro = {
    id: string
    name: string
    nameUrl: string
    description: string
    discount: string 
    latitude: Decimal 
    longitude: Decimal 
    facebook: string | null
    instagram: string | null
    website: string | null
    tags: string[]   
}