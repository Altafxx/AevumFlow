"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import Link from "next/link"

type FormData = {
    email: string;
    password: string;
}

function LoginForm() {
    const searchParams = useSearchParams()
    const from = searchParams.get('from') || '/'
    const [isLoading, setIsLoading] = useState(false)

    const { register, handleSubmit } = useForm<FormData>()

    const onSubmit = async (data: FormData) => {
        try {
            setIsLoading(true)
            const result = await signIn('credentials', {
                ...data,
                redirect: false,
            })

            if (result?.error) {
                toast.error('Invalid credentials')
                return
            }

            window.location.href = from
            //eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold">Welcome back</h1>
                <p className="mt-2 text-gray-600">Please sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    Sign in
                </Button>
            </form>

            {/* <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
            </div>

            <Button
                className="w-full"
                variant="outline"
                onClick={() => signIn('github', { callbackUrl: from })}
            >
                Sign in with GitHub
            </Button> */}

            <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    )
}

export default function Login() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </main>
    )
}