"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { memberSchema } from "~/schemas/member-schema"
import { CardStatus, type Member, PaymentStatus } from "~/types/member"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface MemberFormProps {
    member?: Member; // Optional data for editing
    handleSuccess?: () => void;
}

export function MemberForm({ member, handleSuccess }: MemberFormProps) {
    const router = useRouter();
    const [isSubmitting] = useState(false)

    const utils = api.useUtils();

    // Initialize the mutation hook at the top of your component.
    const createMemberMutation = api.members.create.useMutation({
        onSuccess: async () => {
            // Handle any post-success actions (e.g., notifications, redirection)
            toast.success("Membro criado com sucesso!")

            // Invalidate the query
            await utils.members.getAll.invalidate();

            router.push("/socios")
        },
        onError: () => {
            toast.error("Erro ao criar membro")
        },
    })

    const editMemberMutation = api.members.edit.useMutation({
        onSuccess: async () => {
            if (handleSuccess) {
                handleSuccess();
            }

            await utils.members.getAll.invalidate();
            toast.success("Membro editado com sucesso!")
            router.push("/socios")
        },
        onError: (error) => {
            console.log(error);
            toast.error("Erro ao editar membro")
        },
    })

    const form = useForm<Member>({
        resolver: zodResolver(memberSchema),
        defaultValues: member ? {
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            registrationDate: member.registrationDate,
            course: member.course,
            studentNumber: member.studentNumber,
            address: member.address,
            postalCode: member.postalCode,
            cardStatus: member.cardStatus,
            paymentStatus: member.paymentStatus,
            locality: member.locality,
            country: member.country,
            birthDate: member.birthDate,
            citizenCard: member.citizenCard,
            nif: member.nif,
            phoneNumber: member.phoneNumber,
        } : {
            firstName: "",
            lastName: "",
            email: "",
            course: "",
            registrationDate: new Date().toISOString(),
            studentNumber: "",
            address: "",
            postalCode: "",
            cardStatus: CardStatus.inactive,
            paymentStatus: PaymentStatus.pending,
            locality: "",
            country: "",
            birthDate: new Date().toISOString(),
            citizenCard: "",
            nif: "",
            phoneNumber: "",
        },
    })

    async function onSubmit(data: Member) {
        data.birthDate = new Date(data.birthDate).toISOString();
        data.registrationDate = new Date(data.registrationDate).toISOString();

        const validatedData = memberSchema.parse(data);


        if (member?.id) {
            // Edit the member
            editMemberMutation.mutate({
                id: member.id,
                memberSchema: validatedData,
            });
        } else {
            createMemberMutation.mutate(validatedData);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="registrationDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Registration Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="course"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course</FormLabel>
                            <FormControl>
                                <Input placeholder="Course" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="studentNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Student Number</FormLabel>
                            <FormControl>
                                <Input placeholder="Student number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Address" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                                <Input placeholder="Postal code" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cardStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Card Status</FormLabel>
                            <FormControl>
                                <select {...field}>
                                    {Object.values(CardStatus).map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Status</FormLabel>
                            <FormControl>
                                <select {...field}>
                                    {Object.values(PaymentStatus).map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="locality"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Locality</FormLabel>
                            <FormControl>
                                <Input placeholder="Locality" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                                <Input placeholder="Country" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Birth Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="citizenCard"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Citizen Card</FormLabel>
                            <FormControl>
                                <Input placeholder="Citizen card" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nif"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIF</FormLabel>
                            <FormControl>
                                <Input placeholder="NIF" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="Phone number" {...field} />
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