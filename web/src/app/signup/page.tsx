'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'

export default function SignupPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Password dan konfirmasi tidak sama')
            return
        }
        if (password.length < 6) {
            setError('Password minimal 6 karakter')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        })

        if (error) {
            setError(
                error.message === 'User already registered'
                    ? 'Email sudah terdaftar'
                    : error.message
            )
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
        localStorage.removeItem('merak_guest')
        setTimeout(() => router.push('/'), 1500)
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center max-w-sm border border-white/50">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Berhasil!</h2>
                    <p className="text-sm text-gray-600">Akun berhasil dibuat. Mengalihkan...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center px-6 py-10">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                    <span className="text-4xl">🦚</span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800">Buat Akun Baru</h1>
                <p className="text-sm text-gray-500 mt-1">Daftar untuk menyimpan riwayat prediksi</p>
            </div>

            <div className="w-full max-w-sm">
                <form onSubmit={handleSignup} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-green-100/50 p-6 space-y-4 border border-white/50">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Nama Lengkap</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama lengkap Anda"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none text-gray-800 text-sm transition-all"
                            />
                        </div>
                    </div>

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
                                placeholder="Minimal 6 karakter"
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

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Konfirmasi Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Ulangi password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none text-gray-800 text-sm transition-all"
                            />
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
                            'Daftar'
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-green-600 font-bold hover:underline">
                            Masuk
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
