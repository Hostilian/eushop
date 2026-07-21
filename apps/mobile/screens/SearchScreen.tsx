import React, { useState, useEffect } from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput, View,
  TouchableOpacity, Switch, Alert, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { theme } from '../lib/theme';
import { Ionicons } from '@expo/vector-icons';


const fetchFoods = async (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
        reject(new Error('Failed to load food listings'));
        return;
      }
      resolve([
        { id: '1', name: 'Belgian Chocolates', country: 'Belgium', price: 24.99, category: 'Chocolate', allergens: ['Milk', 'Soya', 'Nuts'], seller: 'Brussels Praline Co.' },
        { id: '2', name: 'Italian Balsamic Vinegar', country: 'Italy', price: 49.99, category: 'Condiment', allergens: ['Sulfites'], seller: 'Modena Olive & Vineyards' },
        { id: '3', name: 'Spanish Manchego Cheese', country: 'Spain', price: 29.99, category: 'Cheese', allergens: ['Milk'], seller: 'Queserías de la Mancha' },
        { id: '4', name: 'German Black Forest Ham', country: 'Germany', price: 18.99, category: 'Charcuterie', allergens: [], seller: 'Schwarzwald Metzgerei' },
        { id: '5', name: 'French Camembert', country: 'France', price: 14.50, category: 'Cheese', allergens: ['Milk'], seller: 'Normandie Fromagerie' },
      ]);
    }, 1000);
  });
};

const EU_ALLERGENS = ['Gluten', 'Eggs', 'Milk', 'Nuts', 'Soya', 'Sulfites'];

export default function SearchScreen({ navigation, route }: any) {
  const [search, setSearch] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.category || '');
  const [allergenExclusions, setAllergenExclusions] = useState<string[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFoods();
      setFoods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleLocation = async (value: boolean) => {
    setUseLocation(value);
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location to search foods near you.');
        setUseLocation(false);
        return;
      }
      try {
        await Location.getCurrentPositionAsync({});
        setLocationName('Near your location (5 km radius)');
      } catch {
        setLocationName('Near Brussels, Belgium (5 km radius)');
      }
    } else {
      setLocationName(null);
    }
  };

  const toggleAllergen = (allergen: string) => {
    setAllergenExclusions(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  };

  const filteredFoods = foods.filter(food => {
    if (search && !food.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && food.category !== selectedCategory) return false;
    if (allergenExclusions.length > 0) {
      if (food.allergens.some((a: string) =>
        allergenExclusions.some(ex => ex.toLowerCase() === a.toLowerCase())
      )) return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchPanel}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search artisanal foods..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.cameraButton} onPress={() => navigation.navigate('BarcodeScanner')}>
            <Ionicons name="camera-outline" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.rowInfo}>
            <Text style={styles.filterLabel}>📍 Location Search</Text>
            {locationName && <Text style={styles.locationSub}>{locationName}</Text>}
          </View>
          <Switch
            value={useLocation}
            onValueChange={toggleLocation}
            trackColor={{ false: '#767577', true: theme.colors.secondary }}
            thumbColor={useLocation ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.stateText}>Loading listings...</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
            {['', 'Chocolate', 'Cheese', 'Condiment', 'Charcuterie'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryTabText, selectedCategory === cat && styles.categoryTabTextActive]}>
                  {cat || 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Free From (Allergen Exclusions)</Text>
          <View style={styles.allergenGrid}>
            {EU_ALLERGENS.map(a => {
              const active = allergenExclusions.includes(a);
              return (
                <TouchableOpacity
                  key={a}
                  style={[styles.allergenChip, active && styles.allergenChipActive]}
                  onPress={() => toggleAllergen(a)}
                >
                  <Text style={[styles.allergenChipText, active && styles.allergenChipTextActive]}>
                    {active ? `✓ No ${a}` : a}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Results ({filteredFoods.length})</Text>
          {filteredFoods.length > 0 ? (
            <View style={styles.grid}>
              {filteredFoods.map(food => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.foodCard}
                  onPress={() => navigation.navigate('Checkout', { product: food })}
                >
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodMeta}>📍 {food.country} · {food.category}</Text>
                  {food.allergens.length > 0 ? (
                    <Text style={styles.allergenWarning}>⚠️ Contains: {food.allergens.join(', ')}</Text>
                  ) : (
                    <Text style={styles.allergenSafe}>✓ No allergens declared</Text>
                  )}
                  <View style={styles.cardFooter}>
                    <Text style={styles.foodPrice}>€{food.price.toFixed(2)}</Text>
                    <Text style={styles.sellerName}>{food.seller}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySub}>Try adjusting your search or filters.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  searchPanel: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowInfo: { flex: 1 },
  filterLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  locationSub: { fontSize: 11, color: theme.colors.secondary, fontWeight: '600', marginTop: 2 },
  centeredState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  stateText: { marginTop: 12, color: theme.colors.textMuted, fontSize: 14 },
  errorText: { color: theme.colors.danger, fontSize: 14, marginBottom: 16, textAlign: 'center' },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  scrollContent: { paddingBottom: 32 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryRow: { paddingLeft: 20 },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
  },
  categoryTabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryTabText: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  categoryTabTextActive: { color: '#fff' },
  allergenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  allergenChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  allergenChipActive: { backgroundColor: theme.colors.danger + '15', borderColor: theme.colors.danger },
  allergenChipText: { fontSize: 11, fontWeight: '600', color: theme.colors.text },
  allergenChipTextActive: { color: theme.colors.danger },
  grid: { paddingHorizontal: 20, gap: 12 },
  foodCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  foodName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  foodMeta: { fontSize: 11, color: theme.colors.textMuted, marginTop: 4 },
  allergenWarning: { fontSize: 11, color: theme.colors.danger, fontWeight: '600', marginTop: 8 },
  allergenSafe: { fontSize: 11, color: theme.colors.success, fontWeight: '600', marginTop: 8 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  foodPrice: { fontSize: 16, fontWeight: '800', color: theme.colors.primary },
  sellerName: { fontSize: 11, color: theme.colors.textMuted },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  emptySub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
});
