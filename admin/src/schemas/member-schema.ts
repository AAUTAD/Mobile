import { z } from "zod";

export const memberSchema = z.object({
    memberId: z.string().nullable().optional(),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    registrationDate: z.date().optional(),
    course: z.string().min(1, { message: "Course is required" }),
    studentNumber: z.string().min(1, { message: "Student number is required" }),
    address: z.string().min(1, { message: "Address is required" }),
    postalCode: z.string().min(1, { message: "Postal code is required" }),

    // Use z.enum() for the paymentStatus to restrict to specific values
    cardStatus: z.enum(["Ativo", "Inativo"], {
        errorMap: () => ({ message: "Invalid card status" })
    }),
    paymentStatus: z.enum(["Arquivado", "Pago", "Pendente"], {
        errorMap: () => ({ message: "Invalid payment status" })
    }),
    nextPayment: z.date().optional(),
    locality: z.string().min(1, { message: "Locality is required" }),
    country: z.string().min(1, { message: "Country is required" }),
    birthDate: z.date(),
    citizenCard: z.string().min(1, { message: "Citizen card is required" }),
    nif: z.string().min(1, { message: "NIF is required" }),
    phoneNumber: z.string().min(1, { message: "Phone number is required" }),
});

export type Member = z.infer<typeof memberSchema>;
