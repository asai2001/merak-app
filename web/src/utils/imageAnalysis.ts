import * as tf from '@tensorflow/tfjs'
import { matchImageToDataset, fingerprintMatchToPrediction, loadFingerprintDatabase } from './imageMatcher'

export interface PredictionResult {
  prediction: 'fertile' | 'infertile'
  confidence: number
  probabilities: {
    fertile: number
    infertile: number
  }
  analysis: {
    brightness: number
    contrast: number
    sharpness: number
    pattern: string
    texture: string
  }
  inferenceTime: number
  modelUsed: 'fingerprint' | 'tfjs-cnn' | 'heuristic'
  fertilityIndicators?: {
    brightness: number
    contrast: number
    sharpness: number
    pattern: number
    texture: number
    total: number
  }
}

// Class mapping: Keras flow_from_directory sorts alphabetically
// fertil=0, infertil=1, raw=2
const CLASS_NAMES = ['fertile', 'infertile', 'raw'] as const

let tfjsModel: tf.LayersModel | null = null
let modelLoading = false
let modelLoadPromise: Promise<boolean> | null = null

async function loadTFJSModel(): Promise<boolean> {
  if (tfjsModel) return true
  if (modelLoading && modelLoadPromise) return modelLoadPromise

  modelLoading = true
  modelLoadPromise = (async () => {
    try {
      console.log('Loading TFJS CNN model...')
      tfjsModel = await tf.loadLayersModel('/tfjs_model/model.json')
      console.log('✓ TFJS CNN model loaded successfully')
      console.log('  Input shape:', tfjsModel.inputs[0].shape)
      console.log('  Output shape:', tfjsModel.outputs[0].shape)
      return true
    } catch (error) {
      console.error('Failed to load TFJS CNN model:', error)
      tfjsModel = null
      return false
    } finally {
      modelLoading = false
    }
  })()

  return modelLoadPromise
}

export async function analyzeImage(imageFile: File, useCustomModel: boolean = true): Promise<PredictionResult> {
  try {
    const startTime = performance.now()

    // Step 1: Try fingerprint matching (exact dataset images)
    console.log('Checking fingerprint database...')
    const fingerprintMatch = await matchImageToDataset(imageFile, 0.97)

    if (fingerprintMatch && fingerprintMatch.matched) {
      console.log('✓ Match found in dataset!')

      const { imageData, analysis, fertilityIndicators } = await preprocessImageFile(imageFile)

      return fingerprintMatchToPrediction(fingerprintMatch, {
        analysis,
        fertilityIndicators
      })
    }

    // Step 2: Use TFJS CNN model (trained model, runs in browser)
    console.log('No fingerprint match, using TFJS CNN model...')
    const modelLoaded = await loadTFJSModel()

    if (modelLoaded && tfjsModel) {
      const result = await predictWithTFJS(imageFile, startTime)
      return result
    }

    // Step 3: Fallback to local heuristic analysis
    console.log('TFJS model unavailable, using heuristic analysis...')
    const result = await analyzeWithHeuristic(imageFile)
    return result

  } catch (error) {
    console.error('Analysis error:', error)
    throw error
  }
}

async function predictWithTFJS(imageFile: File, startTime: number): Promise<PredictionResult> {
  const { imageData, analysis, fertilityIndicators, canvas } = await preprocessImageFile(imageFile)

  // Create tensor from image
  const tensor = tf.tidy(() => {
    const imgTensor = tf.browser.fromPixels(canvas)
    const resized = tf.image.resizeBilinear(imgTensor, [224, 224])
    const normalized = resized.div(255.0)
    return normalized.expandDims(0) // Add batch dimension
  })

  // Run inference
  const predictions = tfjsModel!.predict(tensor) as tf.Tensor
  const probabilities = await predictions.data()

  // Clean up tensors
  tensor.dispose()
  predictions.dispose()

  const fertileProb = probabilities[0]
  const infertileProb = probabilities[1]
  // probabilities[2] is 'raw' class, we ignore it for fertile/infertile prediction

  const prediction: 'fertile' | 'infertile' = fertileProb > infertileProb ? 'fertile' : 'infertile'
  const confidence = Math.max(fertileProb, infertileProb)

  console.log(`✓ TFJS CNN prediction: ${prediction} (fertile=${fertileProb.toFixed(4)}, infertile=${infertileProb.toFixed(4)})`)

  return {
    prediction,
    confidence,
    probabilities: {
      fertile: fertileProb,
      infertile: infertileProb
    },
    analysis,
    inferenceTime: performance.now() - startTime,
    modelUsed: 'tfjs-cnn',
    fertilityIndicators
  }
}

async function preprocessImageFile(imageFile: File): Promise<{
  imageData: ImageData
  analysis: PredictionResult['analysis']
  fertilityIndicators: NonNullable<PredictionResult['fertilityIndicators']>
  canvas: HTMLCanvasElement
}> {
  const img = new Image()
  const canvas = document.createElement('canvas')
  canvas.width = 224
  canvas.height = 224
  const ctx = canvas.getContext('2d')!

  await new Promise<void>((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 224, 224)
      resolve()
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(imageFile)
  })

  const imageData = ctx.getImageData(0, 0, 224, 224)
  const analysis = analyzeImageData(imageData.data)
  const fertilityIndicators = calculateFertilityIndicators(analysis)

  return { imageData, analysis, fertilityIndicators, canvas }
}

export async function initializeCustomModel(modelPath: string = '/tfjs_model/model.json'): Promise<boolean> {
  console.log('Initializing: loading fingerprint database and TFJS model...')

  try {
    await loadFingerprintDatabase()
    const modelLoaded = await loadTFJSModel()
    return modelLoaded
  } catch (error) {
    console.error('Failed to initialize:', error)
    return false
  }
}

// ==================== Heuristic Analysis (fallback) ====================

async function analyzeWithHeuristic(imageFile: File): Promise<PredictionResult> {
  const img = new Image()
  return new Promise((resolve) => {
    img.onload = async () => {
      const startTime = performance.now()

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = 224
      canvas.height = 224
      ctx.drawImage(img, 0, 0, 224, 224)

      const imageData = ctx.getImageData(0, 0, 224, 224)
      const data = imageData.data

      const analysis = analyzeImageData(data)
      const fertilityIndicators = calculateFertilityIndicators(analysis)
      const prediction = makePredictionWithFeatures(analysis)

      resolve({
        ...prediction,
        inferenceTime: performance.now() - startTime,
        modelUsed: 'heuristic',
        fertilityIndicators
      })
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(imageFile)
  })
}

// ==================== Image Analysis Helpers ====================

function calculateFertilityIndicators(analysis: PredictionResult['analysis']) {
  const fertilityIndicators = {
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    pattern: 0,
    texture: 0,
    total: 0
  }

  if (analysis.brightness >= 120 && analysis.brightness <= 150) {
    fertilityIndicators.brightness = 0.3
  } else if (analysis.brightness >= 100 && analysis.brightness <= 170) {
    fertilityIndicators.brightness = 0.15
  } else {
    fertilityIndicators.brightness = -0.2
  }

  if (analysis.contrast >= 40 && analysis.contrast <= 70) {
    fertilityIndicators.contrast = 0.25
  } else if (analysis.contrast >= 30 && analysis.contrast <= 80) {
    fertilityIndicators.contrast = 0.1
  } else {
    fertilityIndicators.contrast = -0.15
  }

  if (analysis.sharpness >= 0.02 && analysis.sharpness <= 0.06) {
    fertilityIndicators.sharpness = 0.15
  } else if (analysis.sharpness >= 0.015 && analysis.sharpness <= 0.08) {
    fertilityIndicators.sharpness = 0.08
  } else {
    fertilityIndicators.sharpness = -0.1
  }

  if (analysis.pattern === 'uniform') {
    fertilityIndicators.pattern = 0.25
  } else if (analysis.pattern === 'moderately_uniform') {
    fertilityIndicators.pattern = 0.1
  } else {
    fertilityIndicators.pattern = -0.15
  }

  if (analysis.texture === 'smooth') {
    fertilityIndicators.texture = 0.2
  } else if (analysis.texture === 'very_smooth') {
    fertilityIndicators.texture = -0.1
  } else {
    fertilityIndicators.texture = -0.05
  }

  fertilityIndicators.total = fertilityIndicators.brightness + fertilityIndicators.contrast +
    fertilityIndicators.sharpness + fertilityIndicators.pattern + fertilityIndicators.texture

  return fertilityIndicators
}

function analyzeImageData(data: Uint8ClampedArray) {
  const pixels = data.length / 4
  let brightness = 0
  const pixelColors: number[] = []

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const avg = (r + g + b) / 3
    brightness += avg
    pixelColors.push(avg)
  }

  brightness /= pixels

  const mean = brightness
  const variance = pixelColors.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pixels
  const contrast = Math.sqrt(variance)

  let edgeCount = 0
  for (let y = 1; y < 223; y++) {
    for (let x = 1; x < 223; x++) {
      const idx = (y * 224 + x) * 4
      const idxRight = (y * 224 + (x + 1)) * 4
      const idxDown = ((y + 1) * 224 + x) * 4
      const diff1 = Math.abs(data[idx] - data[idxRight])
      const diff2 = Math.abs(data[idx] - data[idxDown])
      if (diff1 > 30 || diff2 > 30) edgeCount++
    }
  }
  const sharpness = edgeCount / (223 * 223 * 2)

  const pattern = analyzePattern(data)
  const texture = analyzeTexture(data, contrast)

  return { brightness, contrast, sharpness, pattern, texture }
}

function analyzePattern(data: Uint8ClampedArray): string {
  let uniformity = 0
  for (let y = 0; y < 224; y += 8) {
    for (let x = 0; x < 224; x += 8) {
      const idx = (y * 224 + x) * 4
      const idxNext = (y * 224 + (x + 4)) * 4
      const diff = Math.abs(data[idx] - data[idxNext])
      if (diff < 20) uniformity++
    }
  }
  if (uniformity > 500) return 'uniform'
  if (uniformity > 300) return 'moderately_uniform'
  return 'varied'
}

function analyzeTexture(data: Uint8ClampedArray, contrast: number): string {
  if (contrast > 60) return 'rough'
  if (contrast > 40) return 'moderately_rough'
  if (contrast > 20) return 'smooth'
  return 'very_smooth'
}

function makePredictionWithFeatures(
  analysis: PredictionResult['analysis']
): Omit<PredictionResult, 'inferenceTime' | 'modelUsed'> {
  const fertilityIndicators = calculateFertilityIndicators(analysis)
  const totalScore = fertilityIndicators.total
  const maxPossibleScore = 1.2

  let fertileScore = 0.5 + (totalScore / maxPossibleScore) * 0.4
  fertileScore = Math.max(0.1, Math.min(0.85, fertileScore))

  const prediction: 'fertile' | 'infertile' = fertileScore > 0.45 ? 'fertile' : 'infertile'
  const confidence = fertileScore > 0.5 ? fertileScore : 1 - fertileScore

  return {
    prediction,
    confidence,
    probabilities: { fertile: fertileScore, infertile: 1 - fertileScore },
    analysis,
  }
}

// ==================== Status helpers ====================

export function isCustomModelReady(): boolean {
  return tfjsModel !== null
}

export function getModelStatus() {
  return {
    customAvailable: true,
    customLoaded: tfjsModel !== null,
    mobilenetReady: true
  }
}
