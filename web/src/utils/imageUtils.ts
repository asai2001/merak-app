export async function preprocessImage(file: File, size: number = 224): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        resolve(imageData);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function imageDataToTensor(imageData: ImageData): Float32Array {
  const { data, width, height } = imageData;
  const tensor = new Float32Array(width * height * 3);
  
  for (let i = 0; i < width * height; i++) {
    tensor[i * 3] = data[i * 4] / 255;     // R
    tensor[i * 3 + 1] = data[i * 4 + 1] / 255; // G
    tensor[i * 3 + 2] = data[i * 4 + 2] / 255; // B
  }
  
  return tensor;
}

export async function fileToImageData(file: File, size: number = 224): Promise<Float32Array> {
  const imageData = await preprocessImage(file, size);
  return imageDataToTensor(imageData);
}

export function normalizePixel(value: number): number {
  return value / 255;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence > 0.8) return 'text-green-600';
  if (confidence > 0.6) return 'text-yellow-600';
  return 'text-red-600';
}

export function formatConfidence(confidence: number): string {
  return (confidence * 100).toFixed(2) + '%';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
