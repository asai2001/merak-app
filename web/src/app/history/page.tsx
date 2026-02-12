'use client'

import { useState, useEffect } from 'react'
import { supabase, Prediction } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

export default function HistoryPage() {
    const [user, setUser] = useState<User | null>(null)
    const [predictions, setPredictions] = useState<Prediction[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [showDeleteAll, setShowDeleteAll] = useState(false)
    const router = useRouter()

    useEffect(() => {
        checkAuthAndLoad()
    }, [])

    async function checkAuthAndLoad() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
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
            <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Riwayat Prediksi</h1>
                        <p className="text-sm text-gray-500">{predictions.length} hasil analisis</p>
                    </div>
                    {predictions.length > 0 && (
                        <button
                            onClick={() => setShowDeleteAll(true)}
                            className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-medium"
                        >
                            Hapus Semua
                        </button>
                    )}
                </div>

                {/* Delete All Confirmation */}
                {showDeleteAll && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-red-800">Hapus semua riwayat?</span>
                        </div>
                        <p className="text-sm text-red-600 mb-3">Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={deleteAll}
                                disabled={deleting === 'all'}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5"
                            >
                                {deleting === 'all' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                Ya, Hapus Semua
                            </button>
                            <button
                                onClick={() => setShowDeleteAll(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {predictions.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="text-5xl mb-4">📋</div>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Belum Ada Riwayat</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Mulai analisis gambar telur untuk melihat riwayat prediksi di sini.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
                        >
                            Mulai Deteksi
                        </button>
                    </div>
                )}

                {/* Prediction List */}
                <div className="space-y-3">
                    {predictions.map((p) => (
                        <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                            {/* Thumbnail */}
                            <div className="flex-shrink-0">
                                {p.image_url ? (
                                    <img
                                        src={p.image_url}
                                        alt="Thumbnail"
                                        className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                                        🥚
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {p.prediction === 'fertile' ? (
                                        <span className="inline-flex items-center gap-1 text-sm font-bold text-green-700">
                                            <CheckCircle className="w-4 h-4" /> Fertile
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-sm font-bold text-red-700">
                                            <XCircle className="w-4 h-4" /> Infertile
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                        {(p.confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(p.created_at)}
                                    </span>
                                    <span className="capitalize">{p.model_used}</span>
                                </div>
                            </div>

                            {/* Delete */}
                            <button
                                onClick={() => deletePrediction(p.id)}
                                disabled={deleting === p.id}
                                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                {deleting === p.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
