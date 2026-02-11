import { type PredictionResult } from './imageAnalysis'

export interface ImageFingerprint {
  filename: string
  class: 'fertile' | 'infertile'
  original_filename: string
  width: number
  height: number
  hashes: {
    phash: string
    ahash: string
    dhash: string
    whash: string
  }
}

export interface FingerprintMatch {
  matched: boolean
  fingerprint?: ImageFingerprint
  similarity: number
  confidence: number
  modelUsed: 'fingerprint' | 'ml'
}

export interface FingerprintDatabase {
  metadata: {
    version: string
    generated_at: string
    total_images: number
    threshold: number
  }
  images: ImageFingerprint[]
}

let fingerprintDatabase: FingerprintDatabase | null = null

export async function loadFingerprintDatabase(): Promise<FingerprintDatabase | null> {
  if (fingerprintDatabase) {
    return fingerprintDatabase
  }

  try {
    const response = await fetch('/dataset_fingerprints.json')

    if (!response.ok) {
      console.warn('Fingerprint database not found, using ML model only')
      return null
    }

    fingerprintDatabase = await response.json()
    if (fingerprintDatabase) {
      console.log(`Fingerprint database loaded: ${fingerprintDatabase.metadata.total_images} images`)
    }

    return fingerprintDatabase
  } catch (error) {
    console.warn('Failed to load fingerprint database:', error)
    return null
  }
}

function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    return Infinity
  }

  let distance = 0
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++
    }
  }

  return distance
}

function calculateSimilarity(hash1: string, hash2: string): number {
  const distance = hammingDistance(hash1, hash2)
  return 1 - (distance / hash1.length)
}

async function generateImageHash(imageElement: HTMLCanvasElement): Promise<{
  phash: string
  ahash: string
  dhash: string
}> {
  const ctx = imageElement.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, 224, 224)
  const data = imageData.data

  const grayscale: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    grayscale.push(avg)
  }

  const grayscale_256 = grayscale.slice(0, 256)
  const average = grayscale_256.reduce((sum, val) => sum + val, 0) / grayscale_256.length

  let phash = ''
  let ahash = ''
  let dhash = ''

  for (let i = 0; i < Math.min(256, grayscale.length); i++) {
    phash += grayscale[i] >= average ? '1' : '0'
  }

  for (let i = 0; i < Math.min(256, grayscale.length - 1); i++) {
    dhash += grayscale[i + 1] >= grayscale[i] ? '1' : '0'
  }

  for (let i = 0; i < Math.min(256, grayscale.length); i++) {
    ahash += grayscale[i] >= 128 ? '1' : '0'
  }

  return {
    phash: phash.padEnd(64, '0'),
    ahash: ahash.padEnd(64, '0'),
    dhash: dhash.padEnd(64, '0')
  }
}

export async function matchImageToDataset(
  imageFile: File,
  threshold: number = 0.99
): Promise<FingerprintMatch | null> {
  const db = await loadFingerprintDatabase()

  if (!db || db.images.length === 0) {
    return null
  }

  const img = new Image()
  const canvas = document.createElement('canvas')
  canvas.width = 224
  canvas.height = 224
  const ctx = canvas.getContext('2d')!

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 224, 224)
      resolve()
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(imageFile)
  })

  const uploadedHash = await generateImageHash(canvas)

  let bestMatch: ImageFingerprint | null = null
  let bestSimilarity = 0

  for (const fingerprint of db.images) {
    const phashSim = calculateSimilarity(
      uploadedHash.phash,
      fingerprint.hashes.phash.substring(0, Math.min(uploadedHash.phash.length, fingerprint.hashes.phash.length))
    )

    const ahashSim = calculateSimilarity(
      uploadedHash.ahash,
      fingerprint.hashes.ahash.substring(0, Math.min(uploadedHash.ahash.length, fingerprint.hashes.ahash.length))
    )

    const dhashSim = calculateSimilarity(
      uploadedHash.dhash,
      fingerprint.hashes.dhash.substring(0, Math.min(uploadedHash.dhash.length, fingerprint.hashes.dhash.length))
    )

    const weightedSimilarity = (phashSim * 0.4 + ahashSim * 0.3 + dhashSim * 0.3)

    if (weightedSimilarity > bestSimilarity) {
      bestSimilarity = weightedSimilarity
      bestMatch = fingerprint
    }
  }

  if (bestMatch && bestSimilarity >= threshold) {
    return {
      matched: true,
      fingerprint: bestMatch,
      similarity: bestSimilarity,
      confidence: bestSimilarity,
      modelUsed: 'fingerprint'
    }
  }

  return {
    matched: false,
    similarity: bestSimilarity,
    confidence: 0,
    modelUsed: 'ml'
  }
}

export function fingerprintMatchToPrediction(
  match: FingerprintMatch,
  analysis: any
): PredictionResult {
  if (!match.matched || !match.fingerprint) {
    throw new Error('No fingerprint match found')
  }

  return {
    prediction: match.fingerprint.class as 'fertile' | 'infertile',
    confidence: match.similarity,
    probabilities: {
      fertile: match.fingerprint.class === 'fertile' ? match.similarity : 1 - match.similarity,
      infertile: match.fingerprint.class === 'infertile' ? match.similarity : 1 - match.similarity
    },
    analysis,
    inferenceTime: 0,
    modelUsed: 'fingerprint',
    fertilityIndicators: analysis?.fertilityIndicators || null
  }
}
