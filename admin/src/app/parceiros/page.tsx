"use client"

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar"
import { PartnerForm } from "~/components/partners-form"
import { Button } from "~/components/ui/button"
import Link from "next/link"
import { api } from "~/trpc/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { type Parceiro } from "~/types/parceiro"
import { Badge } from "~/components/ui/badge"
import { toast } from "sonner"
import Image from "next/image"

export default function ParceirosPage() {
  const [editingPartner, setEditingPartner] = useState<Parceiro | null>(null)
  const [editOpen, setEditOpen] = useState<boolean>(false)
  const { data: partners, isLoading } = api.partners.getAll.useQuery();

  const utils = api.useUtils()
  const { mutate: deleteMutation } = api.partners.delete.useMutation({
    onSuccess: async () => {
      await utils.partners.getAll.invalidate()
      toast.success("Partner deleted successfully")
    },
    onError: (error) => {
      toast.error(error.message)
  } 
  })

  const handleDelete = (id: string): void => {
    deleteMutation(id)
  }

  return (
    <SidebarInset>
      <header className="flex h-16 items-center gap-4 border-b px-6">
        <SidebarTrigger />
        <div className="flex-1 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Partners</h1>
          <Link href="/parceiros/criar"><Button>Adicionar Parceiro</Button></Link>
        </div>
      </header>
      <main className="p-6">
        {isLoading ? (
          <div>Loading partners...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners?.map((partner) => {


                return (
                  <TableRow key={partner.id}>
                    <TableCell>
                      {
                        partner.nameUrl != "" &&
                        <Image
                          alt="partner image"
                          src={partner.nameUrl}
                          width={48}
                          height={48}
                          className="h-auto w-12"
                        />
                      }
                      {
                        partner.nameUrl == "" && <div>No Image</div>
                      }
                    </TableCell>
                    <TableCell>{partner.name}</TableCell>
                    <TableCell>{partner.description}</TableCell>
                    <TableCell>{partner.discount}</TableCell>
                    <TableCell className="flex space-x-2">
                      {partner.tags.map((tag) => (<Badge className="capitalize" key={tag}>{tag}</Badge>))}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog open={editingPartner == partner && editOpen} onOpenChange={setEditOpen} >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => setEditingPartner(partner)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[85vh] scroll-smooth overflow-scroll">
                            <DialogHeader>
                              <DialogTitle>Edit Partner</DialogTitle>
                            </DialogHeader> 
                            <PartnerForm
                              parceiro={editingPartner ?? undefined}
                              handleSuccess={() => setEditingPartner(null)}
                              />
                          </DialogContent>
                        </Dialog>
                        {/* {editingPartner != null &&
                          <div className="fixed top-0 left-0 w-screen h-screen bg-white bg-opacity-90 flex items-center justify-center sm:rounded-lg">
                            <div className="z-50 max-h-[85vh] max-w-lg w-full border p-6 bg-white shadow-lg rounded-lg overflow-scroll">
                              <PartnerForm parceiro={editingPartner ?? undefined} handleSuccess={() => setEditingPartner(null)} />
                            </div>
                          </div>}*/}
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(partner.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button> 
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </main>
    </SidebarInset>
  )
}

