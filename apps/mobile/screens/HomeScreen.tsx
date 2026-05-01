import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍫 EUshop</Text>
        <Text style={styles.headerSubtitle}>Discover Europe's Specialty Foods</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Categories</Text>
        <View style={styles.categoryGrid}>
          {['Chocolates', 'Candies', 'Meats', 'Cheese', 'Wines', 'Spices'].map((category) => (
            <TouchableOpacity key={category} style={styles.categoryCard}>
              <Text style={styles.categoryEmoji}>🍫</Text>
              <Text style={styles.categoryName}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
        <TouchableOpacity style={styles.trendingCard}>
          <Text style={styles.trendingEmoji}>🇧🇪</Text>
          <View style={styles.trendingContent}>
            <Text style={styles.trendingTitle}>Belgian Chocolate Truffles</Text>
            <Text style={styles.trendingPrice}>€24.99</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 5,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  trendingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  trendingContent: {
    flex: 1,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  trendingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
    marginTop: 4,
  },
});
