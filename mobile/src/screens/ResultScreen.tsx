import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

interface Prediction {
  prediction: 'fertile' | 'infertile';
  confidence: number;
  probabilities: {
    fertile: number;
    infertile: number;
  };
}

export default function ResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { imageUri } = route.params as { imageUri: string };
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Prediction | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    analyzeImage();
  }, [imageUri]);

  const analyzeImage = async () => {
    setLoading(true);
    setIsDemoMode(false);
    
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'egg.jpg',
      } as any);

      const apiUrl = 'http://10.0.2.2:8000/api/predict';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        
        saveToHistory({
          imageUri,
          prediction: data.prediction,
          confidence: data.confidence,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.error('Prediction failed:', response.status);
        showDemoResult();
      }
    } catch (error) {
      console.log('Backend not available, using demo mode');
      showDemoResult();
    } finally {
      setLoading(false);
    }
  };

  const showDemoResult = () => {
    setIsDemoMode(true);
    const isFertile = Math.random() > 0.5;
    setResult({
      prediction: isFertile ? 'fertile' : 'infertile',
      confidence: 0.75 + Math.random() * 0.2,
      probabilities: {
        fertile: isFertile ? 0.85 : 0.15,
        infertile: isFertile ? 0.15 : 0.85,
      },
    });
  };

  const saveToHistory = (entry: any) => {
    console.log('Saving to history:', entry);
  };

  const getConfidenceColor = () => {
    if (!result) return '#9ca3af';
    if (result.confidence > 0.8) return '#22c55e';
    if (result.confidence > 0.6) return '#eab308';
    return '#ef4444';
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        ) : result ? (
          <View style={styles.resultContainer}>
            {isDemoMode && (
              <View style={styles.demoBanner}>
                <Text style={styles.demoText}>⚠️ Demo Mode - Random Result</Text>
              </View>
            )}
            
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>
                {result.prediction === 'fertile' ? '✅' : '❌'}
              </Text>
            </View>

            <Text style={styles.resultTitle}>
              {result.prediction === 'fertile' ? 'Fertile Egg' : 'Infertile Egg'}
            </Text>

            <Text style={styles.confidenceText}>
              Confidence: {(result.confidence * 100).toFixed(2)}%
            </Text>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${result.confidence * 100}%`, backgroundColor: getConfidenceColor() }
                ]}
              />
            </View>

            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Probabilities:</Text>
              <View style={styles.probabilityRow}>
                <Text style={styles.probabilityLabel}>Fertile:</Text>
                <Text style={styles.probabilityValue}>
                  {(result.probabilities.fertile * 100).toFixed(2)}%
                </Text>
              </View>
              <View style={styles.probabilityRow}>
                <Text style={styles.probabilityLabel}>Infertile:</Text>
                <Text style={styles.probabilityValue}>
                  {(result.probabilities.infertile * 100).toFixed(2)}%
                </Text>
              </View>
            </View>

            <Text style={styles.explanation}>
              {result.prediction === 'fertile'
                ? 'This egg shows signs of fertility and has potential for successful incubation.'
                : 'This egg shows signs of infertility and may not be suitable for incubation.'}
            </Text>
          </View>
        ) : (
          <Text style={styles.errorText}>Failed to analyze image. Please try again.</Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Camera')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Take Another Photo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  imageContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  resultContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  demoBanner: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  demoText: {
    color: '#92400e',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 64,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  probabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  probabilityLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  probabilityValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  explanation: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    margin: 20,
  },
  buttonContainer: {
    gap: 12,
    margin: 20,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  secondaryButtonText: {
    color: '#22c55e',
  },
});
