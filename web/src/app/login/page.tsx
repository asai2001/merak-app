'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff, UserCheck } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [guestLoading, setGuestLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    // If already logged in or guest, go to home
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isGuest = localStorage.getItem('merak_guest') === 'true'
            if (isGuest) { router.push('/'); return }
        }
        supabase?.auth.getUser().then(({ data }) => {
            if (data.user) router.push('/')
        })
    }, [router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(
                error.message === 'Invalid login credentials'
                    ? 'Email atau password salah'
                    : error.message
            )
            setLoading(false)
            return
        }

        localStorage.removeItem('merak_guest')
        router.push('/')
    }

    const handleGuest = () => {
        setGuestLoading(true)
        localStorage.setItem('merak_guest', 'true')
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center px-6 py-10">
            {/* Logo & Title */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                    <span className="text-4xl">🦚</span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Peacock Egg Detector</h1>
                <p className="text-sm text-gray-500 mt-1">Deteksi fertilitas telur merak dengan AI</p>
            </div>

            {/* Login Form Card */}
            <div className="w-full max-w-sm">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-green-100/50 p-6 space-y-4 border border-white/50">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none text-gray-800 text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                    className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none text-gray-800 text-sm transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200/50"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                            ) : (
                                '🔑 Masuk'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500">
                        Belum punya akun?{' '}
                        <Link href="/signup" className="text-green-600 font-bold hover:underline">
                            Daftar
                        </Link>
                    </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-xs text-gray-400 font-medium">atau</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Guest Button */}
                <button
                    onClick={handleGuest}
                    disabled={guestLoading}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-2.5 shadow-sm"
                >
                    {guestLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                    ) : (
                        <><UserCheck className="w-4 h-4" /> Masuk Tanpa Akun</>
                    )}
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-2">
                    Riwayat prediksi tidak tersimpan untuk tamu
                </p>
            </div>
        </div>
    )
}
