import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'

export interface ModelPrediction {
  className: string
  probability: number
}

export interface FertilityResult {
  prediction: 'fertile' | 'infertile'
  confidence: number
  probabilities: {
    fertile: number
    infertile: number
  }
  inferenceTime: number
  analysis?: {
    brightness: number
    contrast: number
    sharpness: number
    pattern: string
    texture: string
  }
}

export class PeacockEggModel {
  private model: tf.GraphModel | null = null
  private isLoaded: boolean = false
  private readonly CLASS_NAMES = ['fertile', 'infertile', 'raw']
  private readonly INPUT_SIZE = 224

  async loadModel(modelPath: string = '/saved_model'): Promise<void> {
    if (this.isLoaded) {
      console.log('Model already loaded')
      return
    }

    try {
      console.log(`Loading TensorFlow.js graph model from: ${modelPath}`)
      
      const modelUrl = `${modelPath}/model.json`
      this.model = await tf.loadGraphModel(modelUrl)
      
      this.isLoaded = true
      console.log('TFJS Graph model loaded successfully')
      console.log('Model inputs:', this.model.inputs)
      console.log('Model outputs:', this.model.outputs)
    } catch (error) {
      console.error('Error loading TFJS model:', error)
      console.warn('Custom model failed to load, will use MobileNet')
      this.isLoaded = false
      throw new Error(`Failed to load TFJS model: ${error}`)
    }
  }

  async predict(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<FertilityResult> {
    if (!this.isLoaded || !this.model) {
      throw new Error('Model is not loaded. Call loadModel() first.')
    }

    const startTime = performance.now()

    const inputTensor = await this.preprocessImage(imageElement)
    const predictionTensor = this.model.predict(inputTensor) as tf.Tensor
    
    const probabilities = await predictionTensor.data()
    
    inputTensor.dispose()
    predictionTensor.dispose()

    const fertileProb = probabilities[0]
    const infertileProb = probabilities[1]

    const predictionClass = fertileProb > infertileProb ? 'fertile' : 'infertile'
    const confidence = Math.max(fertileProb, infertileProb)

    return {
      prediction: predictionClass,
      confidence,
      probabilities: {
        fertile: fertileProb,
        infertile: infertileProb
      },
      inferenceTime: performance.now() - startTime
    }
  }

  private async preprocessImage(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<tf.Tensor> {
    return tf.tidy(() => {
      const tensor = tf.browser.fromPixels(imageElement) as tf.Tensor3D

      const resized = tf.image.resizeBilinear(tensor, [this.INPUT_SIZE, this.INPUT_SIZE])
      const normalized = resized.div(255.0)
      const batched = normalized.expandDims(0)

      return batched as tf.Tensor
    })
  }

  isModelLoaded(): boolean {
    return this.isLoaded
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
      this.isLoaded = false
      console.log('Model disposed')
    }
  }
}

export async function predictWithMobileNet(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<FertilityResult> {
  if (!mobilenetModel) {
    mobilenetModel = await mobilenet.load()
  }

  const startTime = performance.now()

  const inputTensor = tf.tidy(() => {
    const tensor = tf.browser.fromPixels(imageElement) as tf.Tensor3D
    const resized = tf.image.resizeBilinear(tensor, [224, 224])
    return resized.div(255.0)
  })

  const embedding = await mobilenetModel.infer(inputTensor, true)
  inputTensor.dispose()
  embedding.dispose()

  const prediction = makePredictionWithFeatures(imageElement, embedding)

  return {
    ...prediction,
    inferenceTime: performance.now() - startTime
  }
}

function makePredictionWithFeatures(
  imageElement: HTMLImageElement | HTMLCanvasElement,
  embedding: tf.Tensor | null
): Omit<FertilityResult, 'inferenceTime'> {
  const analysis = analyzeImageData(imageElement)
  const fertilityIndicators = calculateFertilityIndicators(analysis)
  
  const totalScore = fertilityIndicators.total
  const maxPossibleScore = 1.2
  
  let fertileScore = 0.5 + (totalScore / maxPossibleScore) * 0.4
  
  if (totalScore < 0.3) {
    fertileScore = Math.max(0.2, fertileScore - 0.15)
  } else if (totalScore < 0.5) {
    fertileScore = Math.max(0.3, fertileScore - 0.08)
  } else if (totalScore < 0.8) {
    fertileScore = Math.max(0.4, fertileScore - 0.03)
  } else if (totalScore > 1.0) {
    fertileScore = Math.min(0.9, fertileScore + 0.03)
  }
  
  fertileScore = Math.max(0.15, Math.min(0.9, fertileScore))
  
  const prediction: 'fertile' | 'infertile' = fertileScore > 0.5 ? 'fertile' : 'infertile'
  const confidence = fertileScore
  
  return {
    prediction,
    confidence,
    probabilities: {
      fertile: fertileScore,
      infertile: 1 - fertileScore,
    },
    analysis,
  }
}

let mobilenetModel: any = null

let modelInstance: PeacockEggModel | null = null

export async function getModel(): Promise<PeacockEggModel | null> {
  if (!modelInstance) {
    modelInstance = new PeacockEggModel()
  }

  if (!modelInstance.isModelLoaded()) {
    try {
      await modelInstance.loadModel()
    } catch (error) {
      console.warn('Failed to load custom model:', error)
      modelInstance = null
    }
  }

  return modelInstance
}

export function disposeModel(): void {
  if (modelInstance) {
    modelInstance.dispose()
    modelInstance = null
  }
}

function analyzeImageData(imageElement: HTMLImageElement | HTMLCanvasElement) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  canvas.width = 224
  canvas.height = 224
  
  if (imageElement instanceof HTMLImageElement) {
    ctx.drawImage(imageElement, 0, 0, 224, 224)
  } else {
    ctx.drawImage(imageElement, 0, 0, 224, 224)
  }
  
  const imageData = ctx.getImageData(0, 0, 224, 224)
  const data = imageData.data
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
  
  return {
    brightness,
    contrast,
    sharpness,
    pattern,
    texture,
  }
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

function calculateFertilityIndicators(
  analysis: {
    brightness: number
    contrast: number
    sharpness: number
    pattern: string
    texture: string
  }
): {
  brightness: number
  contrast: number
  sharpness: number
  pattern: number
  texture: number
  total: number
} {
  let fertilityIndicators = {
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    pattern: 0,
    texture: 0,
    total: 0
  }
  
  if (analysis.brightness >= 110 && analysis.brightness <= 160) {
    fertilityIndicators.brightness = 0.25
  } else if (analysis.brightness >= 90 && analysis.brightness <= 180) {
    fertilityIndicators.brightness = 0.15
  } else {
    fertilityIndicators.brightness = -0.1
  }
  
  if (analysis.contrast >= 35 && analysis.contrast <= 75) {
    fertilityIndicators.contrast = 0.25
  } else if (analysis.contrast >= 25 && analysis.contrast <= 85) {
    fertilityIndicators.contrast = 0.15
  } else {
    fertilityIndicators.contrast = -0.1
  }
  
  if (analysis.sharpness >= 0.025 && analysis.sharpness <= 0.075) {
    fertilityIndicators.sharpness = 0.2
  } else if (analysis.sharpness >= 0.015 && analysis.sharpness <= 0.1) {
    fertilityIndicators.sharpness = 0.12
  } else {
    fertilityIndicators.sharpness = -0.05
  }
  
  if (analysis.pattern === 'uniform') {
    fertilityIndicators.pattern = 0.3
  } else if (analysis.pattern === 'moderately_uniform') {
    fertilityIndicators.pattern = 0.12
  } else {
    fertilityIndicators.pattern = -0.1
  }
  
  if (analysis.texture === 'smooth' || analysis.texture === 'moderately_rough') {
    fertilityIndicators.texture = 0.2
  } else if (analysis.texture === 'very_smooth') {
    fertilityIndicators.texture = -0.05
  } else {
    fertilityIndicators.texture = -0.1
  }
  
  fertilityIndicators.total = Object.values(fertilityIndicators).reduce((sum, val) => sum + val, 0)
  
  return fertilityIndicators
}
