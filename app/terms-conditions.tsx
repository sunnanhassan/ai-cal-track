import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

export default function TermsConditions() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderSection = (title: string, content: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last Updated: April 11, 2026</Text>
        
        <Text style={styles.intro}>
          Please read these Terms and Conditions carefully before using the AI Cal Track mobile application. By accessing or using the App, you agree to be bound by these Terms.
        </Text>

        {renderSection(
          "1. Use of the App",
          "AI Cal Track provides fitness and nutrition tracking services. You must be at least 13 years old to use this service. You are responsible for maintaining the confidentiality of your account information."
        )}

        {renderSection(
          "2. Health Disclaimer",
          "The information provided by AI Cal Track, including calorie goals and AI-generated insights, is for informational purposes only and is not intended as medical advice. Always consult with a healthcare professional before starting a new diet or exercise program."
        )}

        {renderSection(
          "3. User Content",
          "You retain ownership of any data or content you upload to the App. However, you grant AI Cal Track a license to use, store, and process this data to provide and improve our services."
        )}

        {renderSection(
          "4. Prohibited Conduct",
          "You agree not to use the App for any unlawful purpose or to upload any content that is harmful, offensive, or violates the rights of others."
        )}

        {renderSection(
          "5. Limitation of Liability",
          "AI Cal Track is provided 'as is' without warranties of any kind. We are not liable for any damages arising from your use of the App, including but not limited to health outcomes or data loss."
        )}

        {renderSection(
          "6. Changes to Terms",
          "We reserve the right to modify these Terms at any time. Your continued use of the App after changes are posted constitutes your acceptance of the new Terms."
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If you have any questions about these Terms, please contact us at sannanhassan10@gmail.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  intro: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
  },
});
