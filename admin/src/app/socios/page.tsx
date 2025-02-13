"use client"

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar"
import { MemberForm } from "~/components/members-form"
import { Button } from "~/components/ui/button"
import Link from "next/link"
import { api } from "~/trpc/react"
import { toast } from "sonner"

export default function MembersPage() {
    const utils = api.useUtils()
    const { mutate: deleteMutation } = api.members.delete.useMutation({
        onSuccess: async () => {
            await utils.members.getAll.invalidate()
            toast.success("Member deleted successfully")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleDelete = (id: string): void => {
        deleteMutation(id)
    }

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <div className="flex-1 flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Members</h1>
                    <Link href="/socios/criar"><Button>Add Member</Button></Link>
                </div>
            </header>
            <main className="p-6">
                <MemberForm /> 
            </main>
        </SidebarInset>
    )
}