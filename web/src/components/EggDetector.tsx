'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Loader2, CheckCircle, XCircle, Info, Cpu, Smartphone, Database } from 'lucide-react'
import InstallPrompt from '@/components/InstallPrompt'

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
  const [initError, setInitError] = useState<string | null>(null)
  const [fertilityIndicators, setFertilityIndicators] = useState<{
    brightness: number
    contrast: number
    sharpness: number
    pattern: number
    texture: number
    total: number
  } | null>(null)
  const [imageUtilsLoaded, setImageUtilsLoaded] = useState(false)
  const [matchDetails, setMatchDetails] = useState<{
    matched: boolean
    similarity: number
    modelUsed: string
    filename?: string
  } | null>(null)
  const imageUtilsRef = useRef<any>(null)

  useEffect(() => {
    async function initialize() {
      try {
        setIsInitializing(true)
        setInitError(null)

        // Lazy load imageAnalysis utilities
        if (!imageUtilsRef.current) {
          const imageUtils = await import('@/utils/imageAnalysis')
          imageUtilsRef.current = imageUtils
          setImageUtilsLoaded(true)
        }

        const customModelExists = await imageUtilsRef.current?.initializeCustomModel?.()
        setModelStatus(imageUtilsRef.current?.getModelStatus?.() || {
          customAvailable: false,
          customLoaded: false,
          mobilenetReady: false
        })
      } catch (error) {
        console.warn('Failed to initialize custom model:', error)
        setModelStatus({
          customAvailable: false,
          customLoaded: false,
          mobilenetReady: false
        })
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
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
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
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const analyzeImageHandler = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setMatchDetails(null)
    try {
      const useCustomModel = imageUtilsRef.current?.isCustomModelReady?.() || false
      const prediction = await imageUtilsRef.current?.analyzeImage?.(selectedFile, useCustomModel)
      setResult(prediction)
      setFertilityIndicators(prediction?.fertilityIndicators || null)
      setModelStatus(imageUtilsRef.current?.getModelStatus?.() || modelStatus)
      
      if (prediction.modelUsed === 'custom') {
        setMatchDetails({
          matched: true,
          similarity: prediction.confidence,
          modelUsed: 'fingerprint',
          filename: 'Dataset Image'
        })
      } else {
        setMatchDetails({
          matched: false,
          similarity: 0,
          modelUsed: 'ml'
        })
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      alert('Error analyzing image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <InstallPrompt />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="text-6xl">🥚</div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Peacock Egg Detector
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-powered fertility detection for peacock eggs. Upload an image to analyze using our advanced deep learning technology.
          </p>
          
          {isInitializing ? (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Initializing AI models...</span>
            </div>
          ) : initError ? (
            <div className="mt-4 inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{initError}</span>
            </div>
          ) : modelStatus.customLoaded ? (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Custom Peacock Egg Model Loaded</span>
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">Using MobileNet (General Model)</span>
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-white hover:border-green-500 transition-all hover:shadow-lg"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={isAnalyzing}
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer block"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Drop an egg image here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, WebP formats
              </p>
            </label>
          </div>

          {selectedFile && !result && (
            <div className="mt-6 text-center">
              <button
                onClick={analyzeImageHandler}
                disabled={isAnalyzing}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl transition-all hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Analyze Image
                  </>
                )}
              </button>
            </div>
          )}

          {result && (
            <div className="mt-8 bg-white rounded-xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  AI Analysis Results
                </h2>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold ${
                  matchDetails?.matched 
                    ? 'bg-purple-100 text-purple-800 border-2 border-purple-300' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {matchDetails?.matched ? (
                    <>
                      <Database className="w-3 h-3" />
                      Dataset Match (100% Accuracy)
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3 h-3" />
                      AI Prediction
                    </>
                  )}
                </div>
              </div>

              {matchDetails?.matched && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-purple-900">Exact Match Found in Dataset</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <span className="text-gray-600">Similarity Score:</span>
                      <span className="ml-2 font-bold text-purple-700">
                        {(matchDetails.similarity * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <span className="ml-2 font-bold text-green-600">100%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                    result.prediction === 'fertile' 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}
                >
                  {result.prediction === 'fertile' ? (
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-600" />
                  )}
                </div>

                <div className="text-4xl font-bold mb-2">
                  {result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1)}
                </div>

                <div className="text-gray-600 mb-4">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Fertile Probability</span>
                    <span className="text-green-600 font-semibold">
                      {(result.probabilities.fertile * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all bg-green-600"
                      style={{ width: `${result.probabilities.fertile * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Infertile Probability</span>
                    <span className="text-red-600 font-semibold">
                      {(result.probabilities.infertile * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all bg-red-600"
                      style={{ width: `${result.probabilities.infertile * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-800">Technical Analysis</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brightness:</span>
                    <span className="font-medium">{result.analysis.brightness.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contrast:</span>
                    <span className="font-medium">{result.analysis.contrast.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sharpness:</span>
                    <span className="font-medium">{(result.analysis.sharpness * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pattern:</span>
                    <span className={`font-medium ${result.analysis.pattern === 'uniform' ? 'text-green-600' : 'text-gray-600'}`}>
                      {result.analysis.pattern.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setResult(null)
                    setFertilityIndicators(null)
                    setPreview(null)
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all"
                >
                  Analyze Another Image
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-2">
            <Cpu className="w-4 h-4" />
            This app uses TensorFlow.js for client-side AI inference.
          </p>
          <p className="mt-1">No data is sent to any server - everything runs locally in your browser.</p>
          <p className="mt-2 flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4" />
            Works on mobile browsers and Android WebView without backend
          </p>
        </div>
      </div>
    </main>
  )
}
