"use client"

import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { LogOut, LogIn, UserPlus } from "lucide-react"

export function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="animate-pulse text-sm text-muted-foreground">Loading...</div>
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {session.user?.name || session.user?.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut size={18} />
          <span className="hidden sm:inline ml-2">Sign out</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">
          <LogIn size={18} />
          <span className="hidden sm:inline ml-2">Sign in</span>
        </Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/register">
          <UserPlus size={18} />
          <span className="hidden sm:inline ml-2">Sign up</span>
        </Link>
      </Button>
    </div>
  )
}