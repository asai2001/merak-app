import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import GalleryScreen from './screens/GalleryScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#22c55e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Peacock Egg Detector' }}
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ title: 'Take Photo' }}
      />
      <Stack.Screen 
        name="Gallery" 
        component={GalleryScreen} 
        options={{ title: 'Select from Gallery' }}
      />
      <Stack.Screen 
        name="Result" 
        component={ResultScreen} 
        options={{ title: 'Detection Result' }}
      />
      <Stack.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'Prediction History' }}
      />
    </Stack.Navigator>
  );
}
