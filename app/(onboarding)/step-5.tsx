import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { BodyPartMuscleIcon, WeightScaleIcon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { useOnboarding } from './_layout';

export default function Step5() {
  const { data, updateData } = useOnboarding();
  const { user } = useUser();
  const router = useRouter();

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!height || !weight) return;

    if (!user) {
      setError('User context not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    updateData({ height, weight });

    router.replace('/(onboarding)/generating' as any);
  };

  const handleBack = () => {
    router.back();
  };

  const isComplete = height.length > 0 && weight.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Physical stats</Text>
        <Text style={styles.subtitle}>Help us tailor the app to your body type.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.formContainer}>
          <Input
            label="Height (Feet)"
            placeholder="e.g., 5.9"
            keyboardType="decimal-pad"
            value={height}
            onChangeText={setHeight}
            icon={BodyPartMuscleIcon}
          />
          <Input
            label="Weight (Kg)"
            placeholder="e.g., 75"
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
            icon={WeightScaleIcon}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <Button title="Back" onPress={handleBack} variant="outline" style={styles.halfBtn} disabled={loading} />
          <Button
            title="Complete"
            onPress={handleNext}
            disabled={!isComplete || loading}
            isLoading={loading}
            style={styles.halfBtn}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 32,
  },
  formContainer: {
    gap: 8,
  },
  error: {
    color: Colors.error,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.errorBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
  },
  footer: {
    paddingBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  halfBtn: {
    flex: 1,
  },
});
