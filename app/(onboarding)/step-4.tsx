import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { useOnboarding } from './_layout';

export default function Step4() {
  const { data, updateData } = useOnboarding();
  const router = useRouter();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [error, setError] = useState('');

  const handleNext = () => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (!d || !m || !y || d > 31 || m > 12 || y < 1900 || y > new Date().getFullYear()) {
      setError('Please enter a valid date.');
      return;
    }

    // Format as YYYY-MM-DD
    const paddedMonth = m.toString().padStart(2, '0');
    const paddedDay = d.toString().padStart(2, '0');
    const birthDateStr = `${y}-${paddedMonth}-${paddedDay}`;

    updateData({ birthDate: birthDateStr });
    setError('');
    router.push('/(onboarding)/step-5' as any);
  };

  const handleBack = () => {
    router.back();
  };

  const isComplete = day.length > 0 && month.length > 0 && year.length === 4;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>When were you born?</Text>
        <Text style={styles.subtitle}>Age plays a big role in calorie calculations.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <View style={styles.inputWrapper}>
            <Input
              label="Day"
              placeholder="DD"
              keyboardType="number-pad"
              maxLength={2}
              value={day}
              onChangeText={setDay}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Input
              label="Month"
              placeholder="MM"
              keyboardType="number-pad"
              maxLength={2}
              value={month}
              onChangeText={setMonth}
            />
          </View>
          <View style={[styles.inputWrapper, { flex: 1.5 }]}>
            <Input
              label="Year"
              placeholder="YYYY"
              keyboardType="number-pad"
              maxLength={4}
              value={year}
              onChangeText={setYear}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <Button title="Back" onPress={handleBack} variant="outline" style={styles.halfBtn} />
          <Button title="Continue" onPress={handleNext} disabled={!isComplete} style={styles.halfBtn} />
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
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
