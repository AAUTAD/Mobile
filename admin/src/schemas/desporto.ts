import { z } from 'zod';

// Define the schema for Desporto
type Desporto = {
  id?: string ;
  name: string;
  imageUrl?: string;
  type: string;
};

export const desportoSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  imageUrl: z.string().optional(),
  type: z.string(),
});

export type { Desporto };