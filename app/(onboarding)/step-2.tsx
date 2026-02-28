import { useRouter } from 'expo-router';
import { Analytics01Icon, ArrowDownRight01Icon, ArrowUpRight01Icon } from 'hugeicons-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { OptionCard } from '../../components/ui/OptionCard';
import { Colors } from '../../constants/Colors';
import { useOnboarding } from './_layout';

export default function Step2() {
  const { data, updateData } = useOnboarding();
  const router = useRouter();

  const handleNext = () => {
    if (data.goal) {
      router.push('/(onboarding)/step-3' as any);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your primary goal?</Text>
        <Text style={styles.subtitle}>Select the path that best matches your fitness journey.</Text>

        <View style={styles.options}>
          <OptionCard
            label="Gain Weight"
            subLabel="Build muscle and track calorie surplus."
            icon={ArrowUpRight01Icon}
            isSelected={data.goal === 'Gain Weight'}
            onPress={() => updateData({ goal: 'Gain Weight' })}
          />
          <OptionCard
            label="Lose Weight"
            subLabel="Burn fat and manage a calorie deficit."
            icon={ArrowDownRight01Icon}
            isSelected={data.goal === 'Lose Weight'}
            onPress={() => updateData({ goal: 'Lose Weight' })}
          />
          <OptionCard
            label="Maintain Weight"
            subLabel="Stay healthy and keep your current shape."
            icon={Analytics01Icon}
            isSelected={data.goal === 'Maintain Weight'}
            onPress={() => updateData({ goal: 'Maintain Weight' })}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <Button title="Back" onPress={handleBack} variant="outline" style={styles.halfBtn} />
          <Button title="Continue" onPress={handleNext} disabled={!data.goal} style={styles.halfBtn} />
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
