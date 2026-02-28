import { useRouter } from 'expo-router';
import { Activity02Icon, Dumbbell01Icon, WorkoutRunIcon } from 'hugeicons-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { OptionCard } from '../../components/ui/OptionCard';
import { Colors } from '../../constants/Colors';
import { useOnboarding } from './_layout';

export default function Step3() {
  const { data, updateData } = useOnboarding();
  const router = useRouter();

  const handleNext = () => {
    if (data.workoutFrequency) {
      router.push('/(onboarding)/step-4' as any);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Workout details</Text>
        <Text style={styles.subtitle}>How often do you exercise?</Text>

        <View style={styles.options}>
          <OptionCard
            label="2-3 Days"
            subLabel="Light to moderate activity"
            icon={WorkoutRunIcon}
            isSelected={data.workoutFrequency === '2-3 Days'}
            onPress={() => updateData({ workoutFrequency: '2-3 Days' })}
          />
          <OptionCard
            label="3-4 Days"
            subLabel="Regular workouts"
            icon={Activity02Icon}
            isSelected={data.workoutFrequency === '3-4 Days'}
            onPress={() => updateData({ workoutFrequency: '3-4 Days' })}
          />
          <OptionCard
            label="5-6 Days"
            subLabel="Very active, intensive training"
            icon={Dumbbell01Icon}
            isSelected={data.workoutFrequency === '5-6 Days'}
            onPress={() => updateData({ workoutFrequency: '5-6 Days' })}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <Button title="Back" onPress={handleBack} variant="outline" style={styles.halfBtn} />
          <Button title="Continue" onPress={handleNext} disabled={!data.workoutFrequency} style={styles.halfBtn} />
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
  options: {
    gap: 16,
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
