'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Loader2, CheckCircle, XCircle, Info, Cpu, Database, Camera } from 'lucide-react'

export default function EggDetector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [modelStatus, setModelStatus] = useState({
    customAvailable: false,
    customLoaded: false,
    mobilenetReady: false
  })
  const [isInitializing, setIsInitializing] = useState(true)
  const [fertilityIndicators, setFertilityIndicators] = useState<any>(null)
  const [matchDetails, setMatchDetails] = useState<any>(null)
  const imageUtilsRef = useRef<any>(null)

  useEffect(() => {
    async function initialize() {
      try {
        setIsInitializing(true)
        const imageUtils = await import('@/utils/imageAnalysis')
        imageUtilsRef.current = imageUtils
        await imageUtilsRef.current?.initializeCustomModel?.()
        setModelStatus(imageUtilsRef.current?.getModelStatus?.() || {
          customAvailable: false, customLoaded: false, mobilenetReady: false
        })
      } catch (error) {
        console.warn('Init error:', error)
      } finally {
        setIsInitializing(false)
      }
    }
    initialize()
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
      setFertilityIndicators(null)
      setMatchDetails(null)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setResult(null)
      setFertilityIndicators(null)
      setMatchDetails(null)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const analyzeImageHandler = async () => {
    if (!selectedFile) return
    setIsAnalyzing(true)
    setMatchDetails(null)
    try {
      const prediction = await imageUtilsRef.current?.analyzeImage?.(selectedFile, true)
      setResult(prediction)
      setFertilityIndicators(prediction?.fertilityIndicators || null)

      if (prediction?.modelUsed === 'fingerprint') {
        setMatchDetails({ matched: true, similarity: prediction.confidence, modelUsed: 'fingerprint' })
      } else {
        setMatchDetails({ matched: false, similarity: 0, modelUsed: prediction?.modelUsed || 'api' })
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menganalisis gambar. Silakan coba lagi.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAll = () => {
    setSelectedFile(null)
    setResult(null)
    setFertilityIndicators(null)
    setPreview(null)
    setMatchDetails(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🦚</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Peacock Egg Detector
          </h1>
          <p className="text-gray-600">
            Deteksi fertilitas telur merak menggunakan AI
          </p>

          {isInitializing ? (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Memuat model AI...</span>
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">AI Model Siap</span>
            </div>
          )}
        </div>

        {/* Upload Area - Two Options */}
        {!preview && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="space-y-4"
          >
            {/* Hidden inputs */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              id="camera-input"
              disabled={isAnalyzing}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="gallery-input"
              disabled={isAnalyzing}
            />

            {/* Camera Button */}
            <label
              htmlFor="camera-input"
              className="block bg-white border-2 border-green-300 rounded-2xl p-6 text-center hover:border-green-500 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">📷 Ambil Foto</p>
              <p className="text-sm text-gray-500 mt-1">Buka kamera untuk mengambil foto telur</p>
            </label>

            {/* Gallery Button */}
            <label
              htmlFor="gallery-input"
              className="block bg-white border-2 border-blue-300 rounded-2xl p-6 text-center hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">🖼️ Pilih dari Galeri</p>
              <p className="text-sm text-gray-500 mt-1">Pilih gambar telur dari galeri atau file</p>
            </label>

            <p className="text-xs text-gray-400 text-center">Format: JPG, PNG, WebP</p>
          </div>
        )}

        {/* Image Preview */}
        {preview && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative">
              <img
                src={preview}
                alt="Gambar telur yang dipilih"
                className="w-full h-64 object-contain bg-gray-100"
              />
              {!result && (
                <button
                  onClick={resetAll}
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-600 rounded-full w-8 h-8 flex items-center justify-center shadow"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Analyze Button */}
            {selectedFile && !result && (
              <div className="p-4">
                <button
                  onClick={analyzeImageHandler}
                  disabled={isAnalyzing || isInitializing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl transition-all hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Analisis Gambar</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="p-6">
                {/* Match badge */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Hasil Analisis</h2>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${matchDetails?.matched
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                    }`}>
                    {matchDetails?.matched ? (
                      <><Database className="w-3 h-3" /> Dataset Match</>
                    ) : (
                      <><Cpu className="w-3 h-3" /> AI Prediction</>
                    )}
                  </div>
                </div>

                {/* Prediction result */}
                <div className={`text-center p-6 rounded-xl mb-4 ${result.prediction === 'fertile'
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
                  }`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${result.prediction === 'fertile' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    {result.prediction === 'fertile' ? (
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-600" />
                    )}
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${result.prediction === 'fertile' ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {result.prediction === 'fertile' ? 'FERTILE' : 'INFERTILE'}
                  </div>
                  <div className="text-gray-600">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Probability bars */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="font-medium text-gray-700">Fertile</span>
                      <span className="text-green-600 font-semibold">
                        {(result.probabilities.fertile * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-green-500 transition-all"
                        style={{ width: `${result.probabilities.fertile * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="font-medium text-gray-700">Infertile</span>
                      <span className="text-red-600 font-semibold">
                        {(result.probabilities.infertile * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-red-500 transition-all"
                        style={{ width: `${result.probabilities.infertile * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Technical details */}
                {result.analysis && (
                  <div className="p-4 bg-gray-50 rounded-xl mb-4">
                    <h3 className="font-semibold mb-2 text-gray-800 text-sm">Detail Teknis</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Brightness:</span>
                        <span className="font-medium text-gray-700">{result.analysis.brightness.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Contrast:</span>
                        <span className="font-medium text-gray-700">{result.analysis.contrast.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sharpness:</span>
                        <span className="font-medium text-gray-700">{(result.analysis.sharpness * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pattern:</span>
                        <span className="font-medium text-gray-700">{result.analysis.pattern?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset button */}
                <button
                  onClick={resetAll}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  Analisis Gambar Lain
                </button>
              </div>
            )}
          </div>
        )}



        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400 pb-4">
          <p>🦚 AI-powered peacock egg fertility detection</p>
        </div>
      </div>
    </main>
  )
}
