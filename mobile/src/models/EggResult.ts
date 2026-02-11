export interface EggResult {
  prediction: 'fertile' | 'infertile';
  confidence: number;
  probabilities: {
    fertile: number;
    infertile: number;
  };
}

export interface HistoryItem {
  id: string;
  imageUri: string;
  prediction: 'fertile' | 'infertile';
  confidence: number;
  timestamp: string;
}

export interface ScreenParams {
  Home?: undefined;
  Camera?: {
    setImageUri?: (uri: string) => void;
  };
  Gallery?: {
    setImageUri?: (uri: string) => void;
  };
  Result?: {
    imageUri: string;
  };
  History?: undefined;
}
