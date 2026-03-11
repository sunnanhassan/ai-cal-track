import { useUser } from "@clerk/clerk-expo";
import { Notification03Icon } from "hugeicons-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";

export default function Header() {
  const { user } = useUser();

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
        <Notification03Icon size={24} color={Colors.text} variant="stroke" />
        {/* Optional: Add a small red dot indicator for unread notifications here later */}
        <View style={styles.notificationDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderImage: {
    backgroundColor: Colors.surface,
  },
  textContainer: {
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.surface,
  }
});
