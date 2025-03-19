"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/app/action/auth"

type FormData = {
    email: string
    name: string
    password: string
}

export default function Register() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit } = useForm<FormData>()

    const onSubmit = async (data: FormData) => {
        try {
            setIsLoading(true)
            await registerUser(data.email, data.name, data.password)
            toast.success('Registration successful')
            router.push('/login')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">Create an account</h1>
                    <p className="mt-2 text-gray-600">Please sign up to continue</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Name"
                        {...register('name', { required: true })}
                    />
                    <Input
                        type="email"
                        placeholder="Email"
                        {...register('email', { required: true })}
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        {...register('password', { required: true })}
                    />
                    <Button
                        className="w-full"
                        type="submit"
                        disabled={isLoading}
                    >
                        Sign up
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    )
}
