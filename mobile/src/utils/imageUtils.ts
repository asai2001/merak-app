import * as ImageManipulator from 'expo-image-manipulator';

export async function preprocessImage(uri: string, size: number = 224): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        { resize: { width: size, height: size } },
      ],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      }
    );
    
    return result.uri;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw error;
  }
}

export async function imageToTensor(uri: string): Promise<number[][][]> {
  const response = await fetch(uri);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 224;
        canvas.height = 224;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, 224, 224);
          const imageData = ctx.getImageData(0, 0, 224, 224);
          const data = imageData.data;
          
          const tensor: number[][][] = [];
          for (let y = 0; y < 224; y++) {
            tensor[y] = [];
            for (let x = 0; x < 224; x++) {
              const i = (y * 224 + x) * 4;
              tensor[y][x] = [
                data[i] / 255,     // R
                data[i + 1] / 255, // G
                data[i + 2] / 255, // B
              ];
            }
          }
          
          resolve(tensor);
        }
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function normalizePixel(value: number): number {
  return value / 255;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence > 0.8) return '#22c55e';
  if (confidence > 0.6) return '#eab308';
  return '#ef4444';
}

export function formatConfidence(confidence: number): string {
  return (confidence * 100).toFixed(2) + '%';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
