import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MealAnalysis } from '../components/stitch/MealAnalysis';

export default function MealDetailScreen() {
  const params = useLocalSearchParams();
  
  // In a real app, you might fetch data here using params.id
  // For now, we'll render the analysis component
  return <MealAnalysis />;
}
