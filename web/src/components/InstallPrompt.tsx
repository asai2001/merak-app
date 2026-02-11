'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, Smartphone, Loader2 } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstall(false)
      }
    } catch (e) {
      console.warn('Failed to check standalone mode:', e)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShowInstall(false)
  }

  if (!showInstall || dismissed) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl border-2 border-green-500 p-4 flex items-center gap-4">
        <div className="bg-green-100 p-3 rounded-full">
          <Smartphone className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">Install App</p>
          <p className="text-sm text-gray-600">Install this app for better experience</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 px-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
