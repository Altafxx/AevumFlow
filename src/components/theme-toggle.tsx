"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
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

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 py-2 bg-background border rounded-md shadow-lg">
          <div className="px-2 py-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start gap-2 ${theme === 'light' ? 'bg-accent' : ''}`}
                onClick={() => {
                  setTheme('light')
                  setIsOpen(false)
                }}
              >
                <Sun size={16} />
                <span>Light</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start gap-2 ${theme === 'dark' ? 'bg-accent' : ''}`}
                onClick={() => {
                  setTheme('dark')
                  setIsOpen(false)
                }}
              >
                <Moon size={16} />
                <span>Dark</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start gap-2 ${theme === 'system' ? 'bg-accent' : ''}`}
                onClick={() => {
                  setTheme('system')
                  setIsOpen(false)
                }}
              >
                <Monitor size={16} />
                <span>System</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
