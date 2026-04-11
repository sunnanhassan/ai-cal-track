import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RulerPicker } from 'react-native-ruler-picker';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { updateUserWeight } from '../lib/tracking';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function UpdateWeight() {
  const router = useRouter();
  const { user } = useUser();
  const [weight, setWeight] = useState(70);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeight = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, 'users', user.id);
        const snap = await getDoc(userRef);
        if (snap.exists() && snap.data().weight) {
          setWeight(Number(snap.data().weight));
        }
      } catch (err) {
        console.error('Failed to fetch initial weight', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeight();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    const success = await updateUserWeight(user.id, weight);
    
    setIsSaving(false);
    if (success) {
      router.back();
    } else {
      Alert.alert('Error', 'Failed to update weight. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Update Weight</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.currentWeight}>{weight} <Text style={styles.unit}>kg</Text></Text>
        
        <View style={styles.rulerContainer}>
          <RulerPicker
            min={0}
            max={200}
            step={1}
            fractionDigits={0}
            initialValue={weight}
            onValueChange={(number) => setWeight(parseFloat(number.toString()))}
            onValueChangeEnd={(number) => setWeight(parseFloat(number.toString()))}
            unit="kg"
            gapBetweenSteps={10}
            shortStepColor={Colors.border}
            longStepColor={Colors.primary}
            stepWidth={2}
            indicatorColor={Colors.primary}
            indicatorHeight={80}
            valueTextStyle={{ color: Colors.text, fontSize: 16 }}
            unitTextStyle={{ color: Colors.textMuted, fontSize: 14 }}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Update Weight</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentWeight: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 40,
  },
  unit: {
    fontSize: 24,
    color: Colors.textMuted,
    fontWeight: 'normal',
  },
  rulerContainer: {
    width: '100%',
    height: 150,
    marginBottom: 60,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
