import React, { useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, NativeScrollEvent, NativeSyntheticEvent, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { OnboardingScreenWrapper } from '../../components/onboarding/OnboardingShared';
import { Vitality } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 70; // Width of each tick section
const RULER_WIDTH = SCREEN_WIDTH - 48; // Account for wrapper padding

export default function Step3() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const flatListRef = useRef<FlatList>(null);
  
  // Local state for interactive scrolling display
  const [activeValue, setActiveValue] = useState<number | undefined>(data.height);

  const heightOptions = useMemo(() => {
    const options = [];
    if (data.heightUnit === 'cm') {
      for (let i = 80; i <= 240; i++) {
        options.push({ 
          label: `${i}`, 
          value: i, 
          type: i % 10 === 0 ? 'major' : i % 5 === 0 ? 'medium' : 'minor' 
        });
      }
    } else {
      for (let inches = 36; inches <= 96; inches++) {
        const ft = Math.floor(inches / 12);
        const inch = inches % 12;
        const cm = Math.round(inches * 2.54);
        options.push({ 
          label: `${ft}'${inch}"`, 
          value: cm, 
          type: inch === 0 ? 'major' : inch === 6 ? 'medium' : 'minor' 
        });
      }
    }
    return options;
  }, [data.heightUnit]);

  // Sync initial position
  useEffect(() => {
    const targetVal = data.height || (data.heightUnit === 'cm' ? 175 : Math.round(70 * 2.54));
    const index = heightOptions.findIndex(o => o.value >= targetVal);
    if (index !== -1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 });
        setActiveValue(heightOptions[index].value);
      }, 150);
    }
  }, [data.heightUnit]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / ITEM_WIDTH);
    const item = heightOptions[index];
    if (item && item.value !== activeValue) {
      setActiveValue(item.value);
    }
  };

  const currentDisplayValue = useMemo(() => {
    if (!activeValue) return '--';
    if (data.heightUnit === 'cm') return `${activeValue}`;
    const inches = Math.round(activeValue / 2.54);
    const ft = Math.floor(inches / 12);
    const inch = inches % 12;
    return `${ft}'${inch}"`;
  }, [activeValue, data.heightUnit]);

  const handleContinue = () => {
    if (activeValue) {
      updateData({ height: activeValue });
      router.push('/(onboarding)/step-4');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isFocused = activeValue === item.value;
    const isMajor = item.type === 'major' || (item.type === 'medium' && data.heightUnit === 'cm');
    
    return (
      <View style={[styles.rulerItem, { width: ITEM_WIDTH }]}>
        {/* Number Label Above Line */}
        <View style={styles.labelZone}>
          {(isMajor || isFocused) && (
            <Text style={[
              styles.labelBase,
              isFocused ? styles.labelFocused : styles.labelStandard
            ]}>
              {item.label}
            </Text>
          )}
        </View>

        {/* Ticks sticking down from center line */}
        <View style={styles.tickTrack}>
          <View style={[
            styles.tickVertical,
            item.type === 'major' ? styles.tickMajor : item.type === 'medium' ? styles.tickMedium : styles.tickMinor,
            isFocused && styles.tickFocused
          ]} />
        </View>
      </View>
    );
  };

  return (
    <OnboardingScreenWrapper
      title="How tall are you?"
      onContinue={handleContinue}
      continueDisabled={!activeValue}
    >
      <View style={styles.content}>
        
        {/* Professional Value Display */}
        <View style={styles.valueDisplayContainer}>
          <View style={styles.valueRow}>
            <Text style={styles.valueTextMassive}>{currentDisplayValue}</Text>
            
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {
                const next = data.heightUnit === 'cm' ? 'ft' : 'cm';
                updateData({ heightUnit: next, height: undefined });
              }}
              style={styles.inlineUnitToggle}
            >
              <Text style={styles.inlineUnitText}>{data.heightUnit === 'cm' ? 'cm' : 'ft'}</Text>
              <Ionicons name="chevron-down" size={24} color={Vitality.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Mechanical Ruler */}
        <View style={styles.rulerSection}>
          <View style={styles.rulerBox}>
            
            {/* Background Track Line */}
            <View style={styles.baselineTrack} />

            <FlatList
              ref={flatListRef}
              data={heightOptions}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${data.heightUnit}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH}
              decelerationRate="fast"
              onScroll={onScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingHorizontal: (RULER_WIDTH - ITEM_WIDTH) / 2
              }}
              getItemLayout={(_, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index
              })}
            />

            {/* Central Glow / Active Indicator */}
            <View style={styles.focusOverlay} pointerEvents="none">
              <View style={styles.focusLineHorizontal} />
            </View>

            {/* Fading Edges to blend into background */}
            <LinearGradient
              colors={[Vitality.background, 'rgba(19, 19, 24, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fadeLeft}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(19, 19, 24, 0)', Vitality.background]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fadeRight}
              pointerEvents="none"
            />
          </View>
        </View>

      </View>
    </OnboardingScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 16,
  },
  valueDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    marginTop: 20,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  valueTextMassive: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    marginRight: 8,
  },
  inlineUnitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  inlineUnitText: {
    fontSize: 28,
    fontWeight: '800',
    color: Vitality.primary,
    marginRight: 4,
    textTransform: 'lowercase',
  },
  rulerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120, // Give fixed height for track
  },
  rulerBox: {
    height: 120,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  baselineTrack: {
    position: 'absolute',
    top: 60, // Exact center
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  rulerItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align labels above the line
    height: '100%',
  },
  labelZone: {
    height: 60, // Top half
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
  },
  labelBase: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '800',
  },
  labelStandard: {
    fontSize: 20,
  },
  labelFocused: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tickTrack: {
    height: 60, // Bottom half below line
    alignItems: 'center',
  },
  tickVertical: {
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1,
  },
  tickMajor: {
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  tickMedium: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tickMinor: {
    height: 10,
  },
  tickFocused: {
    backgroundColor: Vitality.primary,
    width: 3,
    height: 40,
  },
  focusOverlay: {
    position: 'absolute',
    top: 60, // Matches baselineTrack
    left: (RULER_WIDTH - ITEM_WIDTH) / 2,
    width: ITEM_WIDTH,
    height: 40, // Height of glowing indicator
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  focusLineHorizontal: {
    height: 3,
    width: '100%',
    backgroundColor: Vitality.primary,
    shadowColor: Vitality.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  fadeLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 80,
    zIndex: 5,
  },
  fadeRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 80,
    zIndex: 5,
  },
});
