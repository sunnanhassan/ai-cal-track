import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, useRouter } from 'expo-router';
import { ChartHistogramIcon, Home01Icon, PlusSignIcon, UserIcon } from 'hugeicons-react-native';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FABMenuModal from '../../components/ui/FABMenuModal';
import { useTheme } from '../../context/ThemeContext';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [isFABMenuVisible, setFABMenuVisible] = useState(false);
  
  const styles = useMemo(() => createStyles(colors), [colors]);

  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key].options;
  if ((focusedOptions as any).tabBarStyle?.display === 'none') {
    return null;
  }

  return (
    <>
      <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.tabContent}>
          <View style={styles.tabItems}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              let Icon;
              if (route.name === 'index') Icon = Home01Icon;
              else if (route.name === 'analytics') Icon = ChartHistogramIcon;
              else if (route.name === 'profile') Icon = UserIcon;

              if (!Icon) return null;

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  style={styles.tabItem}
                >
                  <Icon
                    size={isFocused ? 28 : 24}
                    color={isFocused ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity 
            style={styles.fabButton}
            onPress={() => setFABMenuVisible(true)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add new log"
          >
            <PlusSignIcon size={28} color={colors.background} variant="stroke" />
          </TouchableOpacity>
        </View>
      </View>
      <FABMenuModal 
        visible={isFABMenuVisible} 
        onClose={() => setFABMenuVisible(false)} 
      />
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="log-exercise" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="log-exercise-details" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="log-exercise-manual" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="log-exercise-result" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="log-water" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="log-food" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="log-food-details" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="log-food-scan" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabItems: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingRight: 16,
  },
  tabItem: {
    padding: 12,
    borderRadius: 24,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
  }
});
