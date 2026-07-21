import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AllergenFilter from '../../components/marketplace/AllergenFilter';
import { foodAPI } from '../../lib/services';
import { EUAllergen } from '@eushop/compliance';

export default function AllergenFilterScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAllergens, setSelectedAllergens] = useState<EUAllergen[]>([]);

  // Fetch initial data
  useState(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const result = await foodAPI.searchWithOrigin(undefined, undefined, 1, 50);
        setProducts(result.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Using demonstration data.');
        setLoading(false);
      }
    }
    fetchInitialData();
  });

  const filteredProducts = products.filter(product => {
    if (selectedAllergens.length === 0) return true;

    const productAllergens = product.allergens || [];
    return selectedAllergens.some(allergen =>
      productAllergens.includes(allergen)
    );
  });

  return (
    <ScrollView style={styles.container}>
      <AllergenFilter
        selectedAllergens={selectedAllergens}
        onSelectAllergen={setSelectedAllergens}
      />
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          Products ({filteredProducts.length} of {products.length} matching)
        </Text>
        {/* Render products here */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultsContainer: {
    padding: 16,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
});
