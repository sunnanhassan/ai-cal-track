import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { db } from "../lib/firebase";
import { useTheme } from "../context/ThemeContext";

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  upvotes: string[]; // Array of user IDs
  createdAt: any;
}

export default function RequestFeature() {
  const { user } = useUser();
  const router = useRouter();
  const { colors } = useTheme();
  
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    const q = query(collection(db, "feature_requests"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FeatureRequest));
      
      fetched.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
      
      setFeatures(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!newTitle.trim() || !user) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "feature_requests"), {
        title: newTitle.trim(),
        description: newDesc.trim(),
        userId: user.id,
        userName: user.fullName || "Anonymous User",
        upvotes: [user.id], 
        createdAt: serverTimestamp(),
      });
      setNewTitle("");
      setNewDesc("");
    } catch (error) {
      console.error("Error adding feature:", error);
      alert("Failed to submit feature. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUpvote = async (feature: FeatureRequest) => {
    if (!user) return;
    
    const featureRef = doc(db, "feature_requests", feature.id);
    const hasUpvoted = feature.upvotes?.includes(user.id);
    
    try {
      if (hasUpvoted) {
        await updateDoc(featureRef, {
          upvotes: arrayRemove(user.id)
        });
      } else {
        await updateDoc(featureRef, {
          upvotes: arrayUnion(user.id)
        });
      }
    } catch (error) {
      console.error("Error toggling upvote:", error);
    }
  };

  const renderFeatureItem = ({ item }: { item: FeatureRequest }) => {
    const hasUpvoted = item.upvotes?.includes(user?.id || "");
    const upvoteCount = item.upvotes?.length || 0;

    return (
      <View style={styles.featureCard}>
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.featureDesc}>{item.description}</Text>
          ) : null}
          <Text style={styles.featureAuthor}>Suggested by {item.userName}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.upvoteButton, hasUpvoted && styles.upvoteButtonActive]} 
          onPress={() => toggleUpvote(item)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={hasUpvoted ? "chevron-up" : "chevron-up-outline"} 
            size={24} 
            color={hasUpvoted ? colors.primary : colors.textMuted} 
          />
          <Text style={[styles.upvoteCount, hasUpvoted && styles.upvoteCountActive]}>
            {upvoteCount}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feature Requests</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={features}
          keyExtractor={(item) => item.id}
          renderItem={renderFeatureItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Suggest a New Feature</Text>
              <TextInput
                style={styles.input}
                placeholder="What should we build next?"
                placeholderTextColor={colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Optional description..."
                placeholderTextColor={colors.textMuted}
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
                numberOfLines={3}
              />
              <Button
                title="Submit Request"
                onPress={handleSubmit}
                isLoading={submitting}
                style={styles.submitButton}
                disabled={!newTitle.trim()}
                textColor={colors.background}
              />
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="bulb-outline" size={48} color={colors.border} />
                <Text style={styles.emptyText}>No requests yet. Be the first!</Text>
              </View>
            )
          }
        />
      </KeyboardAvoidingView>
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
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    color: colors.text,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 8,
    height: 54,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  featureInfo: {
    flex: 1,
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  featureAuthor: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  upvoteButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  upvoteButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  upvoteCount: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: -2,
  },
  upvoteCountActive: {
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 12,
  }
});
