import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function PrivacyPolicy() {
  const router = useRouter();

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
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last Updated: April 11, 2026</Text>
        
        <Text style={styles.intro}>
          AI Cal Track is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
        </Text>

        {renderSection(
          "1. Information We Collect",
          "We collect information you provide directly to us (e.g., name, email, health metrics) and information collected through third-party services like Clerk (authentication) and Google Gemini (AI health analysis)."
        )}

        {renderSection(
          "2. How We Use Your Data",
          "Your data is used to provide personalized health insights, calorie tracking, and to improve the overall App experience. We do not sell your personal data to third parties."
        )}

        {renderSection(
          "3. Data Sharing",
          "We may share your data with service providers who perform services on our behalf (e.g., Firebase for cloud storage). These providers are prohibited from using your data for any other purpose."
        )}

        {renderSection(
          "4. AI Health Coaching",
          "The AI Health Coach features process your dietary and activity logs to generate insights. This processing is performed securely via Google Gemini API. Please do not upload sensitive medical records that are not relevant to fitness tracking."
        )}

        {renderSection(
          "5. Data Security",
          "We implement industry-standard security measures to protect your data. However, no method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security."
        )}

        {renderSection(
          "6. Your Rights",
          "Depending on your location, you may have rights to access, update, or delete your personal information. You can manage most of your data directly through the App settings."
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For any privacy-related concerns, please contact our Data Protection Officer at sannanhassan10@gmail.com
          </Text>
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
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  intro: {
    fontSize: 15,
    color: Colors.text,
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
    color: Colors.text,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
  },
});
