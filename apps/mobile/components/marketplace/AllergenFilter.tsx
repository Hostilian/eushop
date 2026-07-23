import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EU_ALLERGENS_14, type EUAllergen } from '@eushop/compliance';
import { AllergenBadge } from '../ui/Badge';

interface AllergenFilterProps {
  selectedAllergens: EUAllergen[];
  onSelectAllergen: (selected: EUAllergen[]) => void;
}

export default function AllergenFilter({ selectedAllergens, onSelectAllergen }: AllergenFilterProps) {
  const toggleAllergen = useCallback((allergen: EUAllergen) => {
    const isSelected = selectedAllergens.includes(allergen);
    let newSelection: EUAllergen[];
    if (isSelected) {
      newSelection = selectedAllergens.filter(a => a !== allergen);
    } else {
      newSelection = [...selectedAllergens, allergen];
    }
    onSelectAllergen(newSelection);
  }, [selectedAllergens, onSelectAllergen]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Allergen & Dietary Filters</Text>
        <Text style={styles.subHeaderText}>
          Filter products by allergens they contain.
        </Text>
      </View>

      <View style={styles.grid}>
        {EU_ALLERGENS_14.map(allergen => {
          const isSelected = selectedAllergens.includes(allergen);

          return (
            <TouchableOpacity
              key={allergen}
              onPress={() => toggleAllergen(allergen)}
              style={[
                styles.button,
                isSelected ? styles.buttonSelected : styles.buttonDefault,
              ]}
              aria-pressed={isSelected}
            >
              <AllergenBadge allergen={allergen} />
              <Text style={styles.buttonText}>
                {allergen.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedAllergens.length > 0 && (
        <TouchableOpacity
          onPress={() => onSelectAllergen([])}
          style={styles.clearButton}
        >
          <Text style={styles.clearButtonText}>Clear All Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '32%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  buttonSelected: {
    backgroundColor: 'rgba(0, 0, 255, 0.1)',
    borderColor: 'rgba(0, 0, 255, 0.2)',
  },
  buttonDefault: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0f172a',
  },
  clearButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
