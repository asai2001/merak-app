'use client'

import { useState, useEffect } from 'react'
import { supabase, Prediction } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { Trash2, Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

export default function HistoryPage() {
    const [user, setUser] = useState<User | null>(null)
    const [isGuest, setIsGuest] = useState(false)
    const [predictions, setPredictions] = useState<Prediction[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [showDeleteAll, setShowDeleteAll] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    useEffect(() => {
        checkAuthAndLoad()
    }, [])

    async function checkAuthAndLoad() {
        const guest = localStorage.getItem('merak_guest') === 'true'
        if (guest) {
            setIsGuest(true)
            setLoading(false)
            return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setIsGuest(true)
            setLoading(false)
            return
        }

        setUser(user)
        await loadPredictions()
    }

    async function loadPredictions() {
        setLoading(true)
        const { data, error } = await supabase
            .from('predictions')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setPredictions(data as Prediction[])
        }
        setLoading(false)
    }

    async function deletePrediction(id: string) {
        setDeleting(id)
        const { error } = await supabase
            .from('predictions')
            .delete()
            .eq('id', id)

        if (!error) {
            setPredictions(prev => prev.filter(p => p.id !== id))
        }
        setDeleting(null)
        setConfirmDeleteId(null)
    }

    async function deleteAll() {
        if (!user) return
        setDeleting('all')
        const { error } = await supabase
            .from('predictions')
            .delete()
            .eq('user_id', user.id)

        if (!error) {
            setPredictions([])
        }
        setDeleting(null)
        setShowDeleteAll(false)
    }

    function formatDate(dateStr: string) {
        const date = new Date(dateStr)
        return date.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center page-content">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    // Guest view
    if (isGuest || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 page-content">
                <div className="max-w-lg mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Prediksi</h1>
                    <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                        <div className="text-5xl mb-4">📋</div>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Login Diperlukan</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Login dengan akun untuk menyimpan dan melihat riwayat prediksi Anda.
                        </p>
                        <Link
                            href="/login"
                            onClick={() => localStorage.removeItem('merak_guest')}
                            className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-200/50"
                        >
                            🔑 Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 page-content">
            <div className="max-w-lg mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Riwayat</h1>
                        <p className="text-sm text-gray-500">{predictions.length} hasil analisis</p>
                    </div>
                    {predictions.length > 0 && (
                        <button
                            onClick={() => setShowDeleteAll(true)}
                            className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors font-medium"
                        >
                            Hapus Semua
                        </button>
                    )}
                </div>

                {/* Delete All Confirmation */}
                {showDeleteAll && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-red-800 text-sm">Hapus semua riwayat?</span>
                        </div>
                        <p className="text-xs text-red-600 mb-3">Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={deleteAll}
                                disabled={deleting === 'all'}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                            >
                                {deleting === 'all' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                Ya, Hapus
                            </button>
                            <button
                                onClick={() => setShowDeleteAll(false)}
                                className="bg-white text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {predictions.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                        <div className="text-5xl mb-4">📋</div>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Belum Ada Riwayat</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Mulai analisis gambar telur untuk melihat riwayat di sini.
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium px-6 py-2.5 rounded-2xl text-sm shadow-lg shadow-green-200/50"
                        >
                            Mulai Deteksi
                        </Link>
                    </div>
                )}

                {/* Prediction List */}
                <div className="space-y-3">
                    {predictions.map((p) => (
                        <div key={p.id} className="space-y-2">
                            <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                                {/* Thumbnail */}
                                <div className="flex-shrink-0">
                                    {p.image_url ? (
                                        <img
                                            src={p.image_url}
                                            alt="Thumbnail"
                                            className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                                            🥚
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        {p.prediction === 'fertile' ? (
                                            <span className="inline-flex items-center gap-1 text-sm font-bold text-green-700">
                                                <CheckCircle className="w-3.5 h-3.5" /> Fertile
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-sm font-bold text-red-600">
                                                <XCircle className="w-3.5 h-3.5" /> Infertile
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                            {(p.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                        <span className="flex items-center gap-0.5">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(p.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Delete */}
                                <button
                                    onClick={() => setConfirmDeleteId(p.id)}
                                    disabled={deleting === p.id}
                                    className="flex-shrink-0 p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    {deleting === p.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            {/* Delete Confirmation */}
                            {confirmDeleteId === p.id && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                        <span className="text-xs text-red-700 font-medium">Hapus data ini?</span>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => deletePrediction(p.id)}
                                            disabled={deleting === p.id}
                                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                                        >
                                            Ya, Hapus
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="bg-white text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
