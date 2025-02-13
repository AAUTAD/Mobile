"use client"

import { type FormEvent } from "react";
import { api } from "~/trpc/react";

export default function Form() {
    const { mutate } = api.auth.register.useMutation()
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        mutate({
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirmPassword") as string,
        })
    }

    console.log(api.auth.getAllUsers.useQuery().data)

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-xl">
            <h2>Register</h2>
            <form onSubmit={handleSubmit} className="min-w-[350px] bg-slate-200 flex flex-col gap-4 p-7 rounded-xl">
                <label className="flex flex-col gap-1">
                    Email
                    <input name="email" type="email" />
                </label>
                <label className="flex flex-col gap-1">
                    Password
                    <input name="password" type="password" />
                </label>
                <label className="flex flex-col gap-1">
                    Confirm Password
                    <input name="confirmPassword" type="password" />
                </label>

                <button className="bg-blue-500 text-white p-2 rounded-lg" type="submit">Register</button>
            </form>
        </div>
    )
}