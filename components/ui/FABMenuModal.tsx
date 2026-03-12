import { useRouter } from 'expo-router';
import { AppleIcon, DropletIcon, Dumbbell02Icon, QrCodeIcon, StarIcon } from 'hugeicons-react-native';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface FABMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2; // Screen width - horizontal padding - gap

export default function FABMenuModal({ visible, onClose }: FABMenuModalProps) {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    onClose();
    // Use setTimeout to allow the modal to close smoothly before navigating
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  const handlePremiumAlert = () => {
    onClose();
    setTimeout(() => {
      alert("This is a Premium feature. Upgrade to scan food directly!");
    }, 150);
  };

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
                {/* 1. Log Exercise */}
                <TouchableOpacity 
                  style={styles.card} 
                  activeOpacity={0.7}
                  onPress={() => handleNavigation('/(tabs)/log-exercise')}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                    <Dumbbell02Icon size={28} color="#EF4444" variant="stroke" />
                  </View>
                  <Text style={styles.cardTitle}>Log Exercise</Text>
                  <Text style={styles.cardSubtitle}>Activities & workouts</Text>
                </TouchableOpacity>

                {/* 2. Add Drink Water */}
                <TouchableOpacity 
                  style={styles.card} 
                  activeOpacity={0.7}
                  onPress={() => handleNavigation('/(tabs)/log-water')}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                    <DropletIcon size={28} color="#3B82F6" variant="stroke" />
                  </View>
                  <Text style={styles.cardTitle}>Drink Water</Text>
                  <Text style={styles.cardSubtitle}>Hydration tracking</Text>
                </TouchableOpacity>

                {/* 3. Food Database */}
                <TouchableOpacity 
                  style={styles.card} 
                  activeOpacity={0.7}
                  onPress={() => handleNavigation('/(tabs)/add-log')}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                    <AppleIcon size={28} color="#22C55E" variant="stroke" />
                  </View>
                  <Text style={styles.cardTitle}>Food Database</Text>
                  <Text style={styles.cardSubtitle}>Search thousands of meals</Text>
                </TouchableOpacity>

                {/* 4. Scan Food (Premium) */}
                <TouchableOpacity 
                  style={styles.card} 
                  activeOpacity={0.7}
                  onPress={handlePremiumAlert}
                >
                  <View style={styles.premiumBadge}>
                    <StarIcon size={12} color="#FFFFFF" variant="stroke" />
                  </View>
                  <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 24,
    alignItems: 'flex-start',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
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
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
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
