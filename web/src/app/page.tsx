import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

const EggDetector = dynamic(() => import('@/components/EggDetector'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block mb-4">
          <div className="text-6xl">🥚</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Peacock Egg Detector</h1>
        <p className="text-gray-600">Loading AI models...</p>
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <ErrorBoundary>
      <EggDetector />
    </ErrorBoundary>
  )
}
