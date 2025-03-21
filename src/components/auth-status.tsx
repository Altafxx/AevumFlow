"use client"

import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { LogOut, LogIn, UserPlus, User, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export function AuthStatus() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center w-9 h-9">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === "authenticated") {
    return (
      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          <User size={18} />
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 py-2 bg-background border rounded-md shadow-lg">
            <div className="px-4 py-2 text-sm border-b">
              {session.user?.name || session.user?.email}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start px-4"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut size={18} />
              <span className="ml-2">Sign out</span>
            </Button>
          </div>
        )}
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
