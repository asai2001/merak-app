'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scan, ClipboardList, UserCircle } from 'lucide-react'

const tabs = [
    { href: '/', label: 'Deteksi', icon: Scan },
    { href: '/history', label: 'Riwayat', icon: ClipboardList },
    { href: '/profile', label: 'Akun', icon: UserCircle },
]

export default function BottomNav() {
    const pathname = usePathname()

    // Hide on auth pages
    if (pathname === '/login' || pathname === '/signup') return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
            <div className="max-w-lg mx-auto flex items-center justify-around h-16">
                {tabs.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${active
                                    ? 'text-green-600'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                            <span className={`text-[10px] mt-1 ${active ? 'font-bold' : 'font-medium'}`}>
                                {label}
                            </span>
                            {active && (
                                <div className="absolute top-0 w-12 h-0.5 bg-green-600 rounded-b-full" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
