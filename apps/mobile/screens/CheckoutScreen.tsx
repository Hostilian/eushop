import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput,
  TouchableOpacity, Alert,
} from 'react-native';
import { theme } from '../lib/theme';

export default function CheckoutScreen({ navigation, route }: any) {
  const product = route?.params?.product || {
    id: '1',
    name: 'Artisanal Belgian Chocolates',
    country: 'Belgium',
    price: 24.99,
    seller: 'Brussels Praline Co.',
  };

  const [quantity, setQuantity] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const subtotal = product.price * quantity;
  const platformFee = Math.min(1.50, subtotal * 0.12);
  const total = subtotal + platformFee;

  const handlePay = (method: 'stripe' | 'wallet') => {
    if (method === 'stripe' && (!cardNumber || !expiry || !cvc)) {
      Alert.alert('Incomplete Details', 'Please fill in all card fields.');
      return;
    }
    Alert.alert(
      'Order Placed',
      `Payment of €${total.toFixed(2)} processed via ${method === 'wallet' ? 'Apple/Google Pay' : 'Stripe'}. You will receive a confirmation email.`,
      [{ text: 'Done', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Order Summary */}
      <View style={styles.card}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{product.name}</Text>
          <Text style={styles.itemSeller}>by {product.seller}</Text>
        </View>
        <View style={styles.quantityRow}>
          <Text style={styles.label}>Quantity</Text>
          <View style={styles.qtyControl}>
            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Price Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Price Details</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>€{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Platform Fee</Text>
          <Text style={styles.priceValue}>€{platformFee.toFixed(2)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>€{total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Card Payment */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pay by Card (Stripe)</Text>
        <TextInput
          style={styles.input}
          placeholder="Card number"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="numeric"
          value={cardNumber}
          onChangeText={setCardNumber}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="MM / YY"
            placeholderTextColor={theme.colors.textMuted}
            value={expiry}
            onChangeText={setExpiry}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="CVC"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            secureTextEntry
            value={cvc}
            onChangeText={setCvc}
          />
        </View>
        <TouchableOpacity style={styles.payBtn} onPress={() => handlePay('stripe')}>
          <Text style={styles.payBtnText}>Pay €{total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      {/* Express Checkout */}
      <View style={styles.walletSection}>
        <Text style={styles.dividerText}>— or express checkout —</Text>
        <TouchableOpacity style={styles.walletBtn} onPress={() => handlePay('wallet')}>
          <Text style={styles.walletBtnText}> Pay / Google Pay</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemHeader: {
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12,
  },
  itemName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  itemSeller: { fontSize: 11, color: theme.colors.textMuted },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  qtyBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  qtyBtnText: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  qtyValue: { paddingHorizontal: 12, fontSize: 13, fontWeight: '700', color: theme.colors.text },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  priceLabel: { fontSize: 12, color: theme.colors.textMuted },
  priceValue: { fontSize: 12, color: theme.colors.text, fontWeight: '600' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: { fontSize: 13, fontWeight: '800', color: theme.colors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: theme.colors.primary },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
  },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  payBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  payBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  walletSection: { alignItems: 'center', gap: 12, marginTop: 8 },
  dividerText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },
  walletBtn: {
    backgroundColor: '#000',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  walletBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
