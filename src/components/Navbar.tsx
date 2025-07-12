'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Menu, Search, User } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [search, setSearch] = useState('')

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
      <Link href="/" className="text-xl font-bold text-blue-600">
        StackIt
      </Link>

      <div className="hidden md:flex gap-3 items-center">
        <Link href="/ask">
          <Button>Ask New Question</Button>
        </Link>
        <Button variant="outline">Newest</Button>
        <Button variant="outline">Unanswered</Button>
        <Input
          placeholder="Search..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline">
          <User className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile menu (simplified for now) */}
      <div className="md:hidden">
        <Menu />
      </div>
    </nav>
  )
}
