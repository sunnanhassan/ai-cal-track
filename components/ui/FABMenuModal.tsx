import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { AppleIcon, DropletIcon, Dumbbell02Icon, QrCodeIcon, StarIcon } from 'hugeicons-react-native';
import React, { useMemo } from 'react';
import { Alert, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useFoodStore } from '../../lib/food-store';
import { useTheme } from '../../context/ThemeContext';

interface FABMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2; 

export default function FABMenuModal({ visible, onClose }: FABMenuModalProps) {
  const router = useRouter();
  const { colors, theme: activeTheme } = useTheme();
  
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  const handleScanFoodPress = () => {
    onClose();
    setTimeout(() => {
      Alert.alert(
        "Scan Food",
        "How would you like to provide the image?",
        [
          {
            text: "Take Picture",
            onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
              });

              if (!result.canceled && result.assets[0]) {
                const { setScannedImageUri, setScannedImageBase64 } = useFoodStore.getState();
                setScannedImageUri(result.assets[0].uri);
                setScannedImageBase64(result.assets[0].base64 || null);
                router.push('/(tabs)/log-food-scan');
              }
            }
          },
          {
            text: "Upload from Gallery",
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
              });

              if (!result.canceled && result.assets[0]) {
                const { setScannedImageUri, setScannedImageBase64 } = useFoodStore.getState();
                setScannedImageUri(result.assets[0].uri);
                setScannedImageBase64(result.assets[0].base64 || null);
                router.push('/(tabs)/log-food-scan');
              }
            }
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    }, 150);
  };

  const isDark = activeTheme === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.dragHandle} />
              
              <Text style={styles.title}>What would you like to log?</Text>

              <View style={styles.grid}>
                <TouchableOpacity 
                  style={styles.card} 
                  activeOpacity={0.7}
                  onPress={() => handleNavigation('/(tabs)/log-exercise')}
                >
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#EF444420' : '#FEE2E2' }]}>
                    <Dumbbell02Icon size={28} color="#EF4444" variant="stroke" />
                  </View>
                  <Text style={styles.cardTitle}>Log Exercise</Text>
                  <Text style={styles.cardSubtitle}>Activities & workouts</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.card} 
                  activeOpacity={0.7}
                  onPress={() => handleNavigation('/(tabs)/log-water')}
                >
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#3B82F620' : '#DBEAFE' }]}>
                    <DropletIcon size={28} color="#3B82F6" variant="stroke" />
                  </View>
                  <Text style={styles.cardTitle}>Drink Water</Text>
                  <Text style={styles.cardSubtitle}>Hydration tracking</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.card} 
                  activeOpacity={0.7}
                  onPress={() => handleNavigation('/(tabs)/log-food')}
                >
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#22C55E20' : '#DCFCE7' }]}>
                    <AppleIcon size={28} color="#22C55E" variant="stroke" />
                  </View>
                  <Text style={styles.cardTitle}>Food Database</Text>
                  <Text style={styles.cardSubtitle}>Search thousands of meals</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.card} 
                  activeOpacity={0.7}
                  onPress={handleScanFoodPress}
                >
                  <View style={styles.premiumBadge}>
                    <StarIcon size={12} color="#FFFFFF" variant="stroke" />
                  </View>
                  <View style={[styles.iconBox, { backgroundColor: isDark ? '#A855F720' : '#F3E8FF' }]}>
                    <QrCodeIcon size={28} color="#A855F7" variant="stroke" />
                  </View>
                  <Text style={styles.cardTitle}>Scan Food</Text>
                  <Text style={styles.cardSubtitle}>Barcode & image AI</Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    alignItems: 'flex-start',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    lineHeight: 16,
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F59E0B',
    padding: 6,
    borderRadius: 12,
    zIndex: 10,
  }
});
