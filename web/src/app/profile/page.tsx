'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Loader2, CheckCircle, XCircle, BarChart3 } from 'lucide-react'

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)
    const [isGuest, setIsGuest] = useState(false)
    const [fullName, setFullName] = useState('')
    const [stats, setStats] = useState({ total: 0, fertile: 0, infertile: 0 })
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        const guest = localStorage.getItem('merak_guest') === 'true'

        if (guest) {
            setIsGuest(true)
            setLoading(false)
            return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        setUser(user)
        setFullName(user.user_metadata?.full_name || '')

        // Load profile from DB
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

        if (profile?.full_name) {
            setFullName(profile.full_name)
        }

        // Load stats
        const { data: predictions } = await supabase
            .from('predictions')
            .select('prediction')

        if (predictions) {
            setStats({
                total: predictions.length,
                fertile: predictions.filter(p => p.prediction === 'fertile').length,
                infertile: predictions.filter(p => p.prediction === 'infertile').length,
            })
        }

        setLoading(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        localStorage.removeItem('merak_guest')
        router.push('/login')
    }

    const handleGuestLogout = () => {
        localStorage.removeItem('merak_guest')
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center page-content">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    // Guest view
    if (isGuest) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 page-content">
                <div className="max-w-lg mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Akun</h1>

                    <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">👤</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 mb-1">Mode Tamu</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Login untuk menyimpan riwayat prediksi dan melihat statistik Anda
                        </p>

                        <Link
                            href="/login"
                            onClick={() => localStorage.removeItem('merak_guest')}
                            className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3.5 rounded-2xl mb-3 shadow-lg shadow-green-200/50"
                        >
                            🔑 Login dengan Akun
                        </Link>
                        <Link
                            href="/signup"
                            onClick={() => localStorage.removeItem('merak_guest')}
                            className="block w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-colors"
                        >
                            Buat Akun Baru
                        </Link>
                    </div>

                    <button
                        onClick={handleGuestLogout}
                        className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 py-3"
                    >
                        Keluar dari Mode Tamu
                    </button>
                </div>
            </div>
        )
    }

    // Logged-in view
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 page-content">
            <div className="max-w-lg mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Akun</h1>

                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200/50">
                            <span className="text-3xl">🦚</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-gray-800 truncate">
                                {fullName || 'User'}
                            </h2>
                            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Bergabung {new Date(user?.created_at || '').toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold text-gray-800">Statistik Prediksi</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            <p className="text-[11px] text-gray-500 font-medium mt-1">Total</p>
                        </div>
                        <div className="bg-green-50 rounded-2xl p-4 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-green-700">{stats.fertile}</p>
                            <p className="text-[11px] text-green-600 font-medium mt-1">Fertile</p>
                        </div>
                        <div className="bg-red-50 rounded-2xl p-4 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <XCircle className="w-4 h-4 text-red-500" />
                            </div>
                            <p className="text-2xl font-bold text-red-600">{stats.infertile}</p>
                            <p className="text-[11px] text-red-500 font-medium mt-1">Infertile</p>
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 font-semibold py-3.5 rounded-2xl border border-gray-200 hover:border-red-200 transition-colors shadow-sm"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>

                {/* App Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">🦚 Peacock Egg Detector v1.0</p>
                    <p className="text-[10px] text-gray-300 mt-1">AI-powered egg fertility detection</p>
                </div>
            </div>
        </div>
    )
}
