import { useRouter } from 'expo-router';
import { ArrowLeft02Icon, Search01Icon, PlusSignIcon } from 'hugeicons-react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FatSecretFood, searchFood } from '../../lib/fatsecret';
import { useFoodStore } from '../../lib/food-store';
import { useTheme } from '../../context/ThemeContext';

export default function LogFood() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FatSecretFood[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute search when debouncedQuery changes
  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.trim().length < 3) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const foods = await searchFood(debouncedQuery.trim());
      setResults(foods);
      setIsLoading(false);
    }
    
    performSearch();
  }, [debouncedQuery]);

  const parseFoodDescription = (description: string) => {
    let servingSize = '1 serving';
    let calories = '0';
    let fat = '0';
    let carbs = '0';
    let protein = '0';
    
    const servingMatch = description.match(/Per\s+(.*?)\s+-/i);
    if (servingMatch && servingMatch[1]) servingSize = servingMatch[1].trim();
    
    const calorieMatch = description.match(/Calories:\s*(\d+)kcal/i);
    if (calorieMatch && calorieMatch[1]) calories = calorieMatch[1];

    const fatMatch = description.match(/Fat:\s*([\d.]+)g/i);
    if (fatMatch && fatMatch[1]) fat = fatMatch[1];

    const carbMatch = description.match(/Carbs:\s*([\d.]+)g/i);
    if (carbMatch && carbMatch[1]) carbs = carbMatch[1];

    const proteinMatch = description.match(/Protein:\s*([\d.]+)g/i);
    if (proteinMatch && proteinMatch[1]) protein = proteinMatch[1];
    
    return { servingSize, calories, fat, carbs, protein };
  };

  const renderItem = ({ item }: { item: FatSecretFood }) => {
    const { servingSize, calories, fat, carbs, protein } = parseFoodDescription(item.food_description);
    
    const handleSelect = () => {
      useFoodStore.getState().setSelectedFood({
        foodId: item.food_id,
        foodName: item.food_name,
        brandName: item.brand_name,
        servingSize,
        calories,
        fat,
        carbs,
        protein,
        foodUrl: item.food_url
      });
      router.push('/(tabs)/log-food-details' as any);
    };

    return (
      <TouchableOpacity style={styles.foodCard} activeOpacity={0.7} onPress={handleSelect}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.food_name}</Text>
          {item.brand_name && <Text style={styles.brandName}>{item.brand_name}</Text>}
          <Text style={styles.servingSize}>{servingSize}</Text>
        </View>
        <div style={styles.rightActions as any}>
          <View style={styles.calorieBox}>
            <Text style={styles.calorieValue}>{calories}</Text>
            <Text style={styles.calorieLabel}>kcal</Text>
          </View>
          <View style={styles.addButton}>
             <PlusSignIcon size={20} color={colors.background} variant="stroke" />
          </View>
        </div>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft02Icon size={24} color={colors.text} variant="stroke" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Food</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search01Icon size={20} color={colors.textMuted} variant="stroke" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search our database..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isLoading && <ActivityIndicator color={colors.primary} size="small" style={styles.loader} />}
        </View>
        <Text style={styles.searchHint}>Type at least 3 characters to search</Text>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) => item.food_id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          query.length >= 3 && !isLoading ? (
             <Text style={styles.emptyText}>No exact matches found. Try another term.</Text>
          ) : null
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
  },
  loader: {
    marginLeft: 12,
  },
  searchHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodInfo: {
    flex: 1,
    paddingRight: 16,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  servingSize: {
    fontSize: 14,
    color: colors.textMuted,
  },
  calorieBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  calorieValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  calorieLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 40,
  }
});
