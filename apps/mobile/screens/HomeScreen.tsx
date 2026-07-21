import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, StatusBar, ActivityIndicator } from 'react-native';
import { theme } from '../lib/theme';

// Simulate API fetch
const fetchTrendingFoods = async (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate empty state (10% chance)
      if (Math.random() < 0.1) {
        resolve([]);
        return;
      }
      // Simulate error state (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Failed to load trending foods');
      }
      // Return mock data
      resolve([
        {
          id: '1',
          name: 'Artisanal Belgian Chocolates',
          country: 'Belgium',
          price: 24.99,
          description: 'Fine handmade pralines and truffles by Brussels master chocolatiers.',
          emoji: '🇧🇪',
          seller: 'Brussels Praline Co.'
        },
        {
          id: '2',
          name: 'Aceto Balsamico DOP',
          country: 'Italy',
          price: 49.99,
          description: 'Aged balsamic vinegar of Modena DOP, matured in oak casks.',
          emoji: '🇮🇹',
          seller: 'Modena Olive & Vineyards'
        },
        {
          id: '3',
          name: 'Spanish Manchego Cheese',
          country: 'Spain',
          price: 29.99,
          description: 'Cured sheep milk cheese from La Mancha, matured 12 months.',
          emoji: '🇪🇸',
          seller: 'Queserías de la Mancha'
        }
      ]);
    }, 1000); // Simulate network delay
  });
}

export default function HomeScreen({ navigation }: any) {
  const categories = [
    { name: 'Chocolate', emoji: '🍫' },
    { name: 'Cheese', emoji: '🧀' },
    { name: 'Wine', emoji: '🍷' },
    { name: 'Charcuterie', emoji: '🍖' },
    { name: 'Pastry', emoji: '🥐' },
    { name: 'Condiment', emoji: '🏺' }
  ];

  const [trendingFoods, setTrendingFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTrendingFoods();
        setTrendingFoods(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* V20 Gourmet Header */}
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>🌿 V20 RELAUNCH</Text>
        </View>
        <Text style={styles.headerTitle}>EUshop</Text>
        <Text style={styles.headerSubtitle}>Exquisite Artisanal Foods • Pan-EU Delivery</Text>
      </View>

      {/* Featured Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Categories</Text>
        <View style={styles.categoryGrid}>
          <TouchableOpacity 
              key={'allergen-filter'} 
              style={styles.categoryCard}
              onPress={() => navigation.navigate('AllergenFilter')}
            >
              <Text style={styles.categoryEmoji}>🔬</Text>
              <Text style={styles.categoryName}>Allergen Filter</Text>
            </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.name} 
              style={styles.categoryCard}
              onPress={() => navigation.navigate('Search', { category: category.name })}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Direct From European Producers</Text>
        <Text style={styles.heroText}>Every merchant is verified for KYBC compliance under DSA Article 30. DAC7 tax reporting is in progress.</Text>
      </View>

      {/* Trending Now */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading trending foods...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => {
              setLoading(true);
              fetchTrendingFoods().then(setTrendingFoods).catch(setError).finally(() => setLoading(false));
            }}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : trendingFoods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🍽️ No trending foods found</Text>
            <Text style={styles.emptySubtext}>Check back later for new artisanal discoveries!</Text>
          </View>
        ) : (
          <View style={styles.trendingGrid}>
            {trendingFoods.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.trendingCard}
                onPress={() => navigation.navigate('Checkout', { product: food })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmoji}>{food.emoji}</Text>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{food.name}</Text>
                    <Text style={styles.cardSeller}>by {food.seller}</Text>
                  </View>
                </View>
                <Text style={styles.cardDescription} numberOfLines={2}>{food.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardPrice}>€{food.price.toFixed(2)}</Text>
                  <View style={styles.buyButton}>
                    <Text style={styles.buyButtonText}>Buy Now</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
    borderBottomLeftRadius: theme.borderRadius.xxl,
    borderBottomRightRadius: theme.borderRadius.xxl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  badgeContainer: {
    backgroundColor: 'rgba(212, 163, 115, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xl,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.3)',
    marginBottom: 12,
  },
  badgeText: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    fontFamily: theme.typography.fontFamilyHeadings,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 6,
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 16,
    fontFamily: theme.typography.fontFamilyHeadings,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  heroBanner: {
    backgroundColor: theme.colors.secondary,
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 6,
    fontFamily: theme.typography.fontFamilyHeadings,
  },
  heroText: {
    fontSize: 11,
    color: '#3e3a30',
    lineHeight: 16,
    fontWeight: '500',
  },
  trendingGrid: {
    gap: 16,
  },
  trendingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  cardSeller: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  buyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
