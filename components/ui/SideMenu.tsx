import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vitality } from '../../constants/Colors';
import { useMenuStore } from '../../lib/menu-store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.8;

export const SideMenu = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, closeMenu } = useMenuStore();
  
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const navigateTo = (route: string) => {
    closeMenu();
    // Allow animation to finish before navigating to prevent jank
    setTimeout(() => {
      router.push(route as any);
    }, 200);
  };

  if (!isOpen && fadeAnim._value === 0) return null;

  const NavItem = ({ icon, label, route, iconType = 'feather' }: { icon: any, label: string, route: string, iconType?: 'feather' | 'ionicons' | 'mci' }) => {
    const isActive = pathname === route;
    
    return (
      <TouchableOpacity 
        style={[styles.navItem, isActive && styles.navItemActive]} 
        onPress={() => navigateTo(route)}
      >
        <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
          {iconType === 'feather' && <Feather name={icon} size={20} color={isActive ? Vitality.background : Vitality.text} />}
          {iconType === 'ionicons' && <Ionicons name={icon} size={20} color={isActive ? Vitality.background : Vitality.text} />}
          {iconType === 'mci' && <MaterialCommunityIcons name={icon} size={20} color={isActive ? Vitality.background : Vitality.text} />}
        </View>
        <Text style={[styles.navText, isActive && styles.navTextActive]}>{label}</Text>
        {isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={closeMenu}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)', opacity: fadeAnim }]} />
      </Pressable>

      {/* Menu Panel */}
      <Animated.View style={[styles.menuPanel, { transform: [{ translateX: slideAnim }], paddingTop: insets.top + 20 }]}>
        <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="lightning-bolt" size={28} color={Vitality.primary} />
            <Text style={styles.logoText}>Antigravity</Text>
          </View>
          <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Vitality.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.navSection}>
           <NavItem icon="home" label="Dashboard" route="/(tabs)" />
           <NavItem icon="bar-chart-2" label="Analytics" route="/(tabs)/analytics" />
           <NavItem icon="user" label="My Profile" route="/(tabs)/profile" />
        </View>

        <View style={styles.divider} />

        <View style={styles.navSection}>
           <NavItem icon="settings" label="Settings" route="/preferences" />
           <NavItem icon="bell" label="Notifications" route="/notifications" />
           <NavItem icon="shield-check" label="Privacy & Security" route="/privacy-policy" iconType="mci" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>v1.0.0 Pro Edition</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuPanel: {
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: 'rgba(19, 19, 24, 0.95)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 24,
    marginVertical: 12,
  },
  navSection: {
    paddingHorizontal: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(89, 222, 155, 0.05)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconBoxActive: {
    backgroundColor: Vitality.primary,
  },
  navText: {
    fontSize: 16,
    fontWeight: '600',
    color: Vitality.textMuted,
  },
  navTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  activeIndicator: {
    position: 'absolute',
    right: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Vitality.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Vitality.textMuted,
    opacity: 0.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
