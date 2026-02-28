// Wait, we should use 'expo-router', not 'react-router-native'
import { useRouter as useExpoRouter } from 'expo-router';
import { UserIcon } from 'hugeicons-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { OptionCard } from '../../components/ui/OptionCard';
import { Colors } from '../../constants/Colors';
import { useOnboarding } from './_layout';

export default function Step1() {
  const { data, updateData } = useOnboarding();
  const router = useExpoRouter();

  const handleNext = () => {
    if (data.gender) {
      router.push('/(onboarding)/step-2' as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your gender?</Text>
        <Text style={styles.subtitle}>This helps us calculate your specific calorie needs.</Text>

        <View style={styles.options}>
          <OptionCard
            label="Male"
            icon={UserIcon}
            isSelected={data.gender === 'Male'}
            onPress={() => updateData({ gender: 'Male' })}
          />
          <OptionCard
            label="Female"
            icon={UserIcon}
            isSelected={data.gender === 'Female'}
            onPress={() => updateData({ gender: 'Female' })}
          />
          <OptionCard
            label="Other"
            icon={UserIcon}
            isSelected={data.gender === 'Other'}
            onPress={() => updateData({ gender: 'Other' })}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleNext} disabled={!data.gender} />
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
});
