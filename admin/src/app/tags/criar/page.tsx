import Link from "next/link";
import { TagForm } from "~/components/tag-form";
import { SidebarInset } from "~/components/ui/sidebar";
import { FileTestForm } from "~/components/file-test-form";
import { ArrowLeft } from "lucide-react";

export default function CriarTagPage() {
    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <div className="h-full w-full flex justify-between items-center">
                    <Link href={`/tags`} className="flex items-center gap-2">
                        <ArrowLeft className="cursor-pointer h-4 w-auto" />
                        <span className="text-lg">Voltar</span>
                    </Link>
                </div>
            </header>
            <main className="p-6">
                <div>
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6">Add/Edit Tag</h2>
                        <TagForm />
                    </div>
                </div>
            </main>
        </SidebarInset>
    )
}