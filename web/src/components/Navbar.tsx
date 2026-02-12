'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, History, Scan, Menu, X } from 'lucide-react'

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setMenuOpen(false)
    }

    const isActive = (path: string) => pathname === path

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-gray-800">
                        <span className="text-2xl">🦚</span>
                        <span className="text-sm">Merak App</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden sm:flex items-center gap-1">
                        <Link
                            href="/"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span className="flex items-center gap-1.5">
                                <Scan className="w-4 h-4" />
                                Deteksi
                            </span>
                        </Link>

                        {user && (
                            <Link
                                href="/history"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/history') ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="flex items-center gap-1.5">
                                    <History className="w-4 h-4" />
                                    Riwayat
                                </span>
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs text-gray-500 max-w-[120px] truncate">
                                    {user.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="ml-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="sm:hidden border-t pb-3 pt-2 space-y-1">
                        <Link
                            href="/"
                            onClick={() => setMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive('/') ? 'bg-green-100 text-green-700' : 'text-gray-600'
                                }`}
                        >
                            🔍 Deteksi
                        </Link>

                        {user && (
                            <Link
                                href="/history"
                                onClick={() => setMenuOpen(false)}
                                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive('/history') ? 'bg-green-100 text-green-700' : 'text-gray-600'
                                    }`}
                            >
                                📋 Riwayat
                            </Link>
                        )}

                        {user ? (
                            <div className="border-t mt-2 pt-2">
                                <div className="px-3 py-1 text-xs text-gray-500 truncate">{user.email}</div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setMenuOpen(false)}
                                className="block px-3 py-2.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg"
                            >
                                🔑 Login
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}
