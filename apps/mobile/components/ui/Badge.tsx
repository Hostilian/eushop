import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EUAllergen, EU_ALLERGENS_14 } from '@eushop/compliance';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{children}</Text>
    </View>
  );
};

interface AllergenBadgeProps {
  allergen: EUAllergen;
}

export const AllergenBadge: React.FC<AllergenBadgeProps> = ({ allergen }) => {
  const allergenInfo = EU_ALLERGENS_14.find(a => a === allergen);
  if (!allergenInfo) return null;

  return (
    <Badge variant="outline">
      {allergen}
    </Badge>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  default: {
    backgroundColor: '#000',
  },
  text_default: {
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#f1f5f9',
  },
  text_secondary: {
    color: '#0f172a',
  },
  destructive: {
    backgroundColor: '#ef4444',
  },
  text_destructive: {
    color: '#fff',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  text_outline: {
    color: '#0f172a',
  },
});
