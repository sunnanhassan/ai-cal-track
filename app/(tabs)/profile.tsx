import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/Colors";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: () => {
            signOut();
            // Global auth guard in _layout.tsx will handle navigation to /(auth)/sign-in
          } 
        }
      ]
    );
  };

  const handleContactUs = () => {
    const email = 'sannanhassan10@gmail.com';
    const subject = 'Support Request - AI Cal Track';
    const body = `Hello Support Team,\n\nI am writing to you regarding my account (${user?.primaryEmailAddress?.emailAddress})...\n\n`;
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const renderOption = (icon: string, label: string, color: string = Colors.text, onPress?: () => void) => (
    <TouchableOpacity style={styles.optionRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.optionLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        <Text style={[styles.optionLabel, { color: Colors.text }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <Image 
            source={{ uri: user?.imageUrl }} 
            style={styles.avatar} 
            contentFit="cover"
            transition={500}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || "User Name"}</Text>
            <Text style={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress || "email@example.com"}</Text>
          </View>
        </View>

        {/* Free Trial Banner */}
        <TouchableOpacity style={styles.trialCard} activeOpacity={0.9}>
          <View style={styles.trialLeft}>
            <View style={styles.trialIconContainer}>
              <Ionicons name="sparkles" size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.trialTitle}>Start Free Trial</Text>
              <Text style={styles.trialSubtitle}>Start 7 days Free trial</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>

        {/* Account Section */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.sectionCard}>
          {renderOption("person-outline", "Personal Details", Colors.text, () => router.push('/personal-details'))}
          <View style={styles.divider} />
          {renderOption("settings-outline", "Preferences", Colors.text, () => router.push('/preferences'))}
          <View style={styles.divider} />
          {renderOption("star-outline", "Upgrade to Premium Features", Colors.primary)}
        </View>

        {/* Support Section */}
        <Text style={styles.sectionHeader}>Support</Text>
        <View style={styles.sectionCard}>
          {renderOption("bulb-outline", "Request new features", Colors.text, () => router.push('/request-feature'))}
          <View style={styles.divider} />
          {renderOption("mail-outline", "Contact Us", Colors.text, handleContactUs)}
          <View style={styles.divider} />
          {renderOption("document-text-outline", "Terms and condition", Colors.text, () => router.push('/terms-conditions'))}
          <View style={styles.divider} />
          {renderOption("shield-checkmark-outline", "Privacy Policy", Colors.text, () => router.push('/privacy-policy'))}
        </View>

        {/* Logout Button */}
        <View style={styles.footer}>
          <Button 
            title="Log Out" 
            onPress={handleLogout} 
            variant="outline"
            style={styles.logoutButton}
            textStyle={styles.logoutText}
            icon={<Ionicons name="log-out-outline" size={20} color={Colors.error} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for tab bar
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'left',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.border,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  trialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary + '10', // Light green background
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  trialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trialTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  trialSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    marginHorizontal: 32,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    borderRadius: 24,
    paddingVertical: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    opacity: 0.5,
  },
  footer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  logoutButton: {
    borderColor: Colors.error + '30',
    height: 60,
  },
  logoutText: {
    color: Colors.error,
  }
});
