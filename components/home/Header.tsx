import { useUser } from "@clerk/clerk-expo";
import { Notification03Icon } from "hugeicons-react-native";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function Header() {
  const { user } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';
  const profileImageUrl = user?.imageUrl;

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        {profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage]} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{userName}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={() => console.log('Notification pressed')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Notification03Icon size={24} color={colors.text} variant="stroke" />
        <View style={styles.notificationDot} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderImage: {
    backgroundColor: colors.surface,
  },
  textContainer: {
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
  }
});
