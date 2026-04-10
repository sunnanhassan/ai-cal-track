import { useRouter } from 'expo-router';
import { ArrowLeft02Icon, Search01Icon, PlusSignIcon } from 'hugeicons-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { FatSecretFood, searchFood } from '../../lib/fatsecret';
import { useFoodStore } from '../../lib/food-store';

export default function LogFood() {
  const router = useRouter();
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
    // Expected format e.g. "Per 1 serving - Calories: 300kcal | Fat: 13.00g | Carbs: 32.00g | Protein: 15.00g"
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
        <View style={styles.rightActions}>
          <View style={styles.calorieBox}>
            <Text style={styles.calorieValue}>{calories}</Text>
            <Text style={styles.calorieLabel}>kcal</Text>
          </View>
          <View style={styles.addButton}>
             <PlusSignIcon size={20} color={Colors.background} variant="stroke" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft02Icon size={24} color={Colors.text} variant="stroke" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Food</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search01Icon size={20} color={Colors.textMuted} variant="stroke" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search our database..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isLoading && <ActivityIndicator color={Colors.primary} size="small" style={styles.loader} />}
        </View>
        <Text style={styles.searchHint}>Type at least 3 characters to search</Text>
      </View>

      {/* Results List */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.text,
    marginLeft: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
    height: '100%',
  },
  loader: {
    marginLeft: 12,
  },
  searchHint: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  servingSize: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  calorieBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  calorieValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  calorieLabel: {
    fontSize: 12,
    color: Colors.textMuted,
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
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 40,
  }
});
