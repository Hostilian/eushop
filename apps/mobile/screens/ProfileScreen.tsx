import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';

export default function ProfileScreen({ navigation }: any) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Seller Application State (DSA / DAC7)
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  const [vat, setVat] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');
  const [selfCertified, setSelfCertified] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter email and password.');
      return;
    }
    setIsLoggedIn(true);
    setRole(email.includes('seller') ? 'SELLER' : 'BUYER');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole('BUYER');
    setShowApplyForm(false);
  };

  const submitSellerApp = () => {
    if (!businessName || !phone || !regNumber || !taxId || !street || !city || !postal) {
      Alert.alert('Verification Error', 'All verification fields are mandatory to comply with DSA and DAC7 standards.');
      return;
    }
    if (!selfCertified) {
      Alert.alert('Compliance Error', 'You must self-certify compliance with EU consumer protection rules.');
      return;
    }

    setRole('SELLER');
    setShowApplyForm(false);
    Alert.alert('Verification Success', 'Your compliance record is synced. You can now publish listings.');
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Login or Sign Up</Text>
          <Text style={styles.subtitle}>Access your buyer profile or manage your verified merchant listings.</Text>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email address..."
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password..."
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>


          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Text style={styles.avatar}>👤</Text>
          <View>
            <Text style={styles.userName}>{email.split('@')[0].toUpperCase()}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <Text style={styles.userRole}>Role: {role}</Text>
          </View>
        </View>

        {/* Conditional Seller Section */}
        {role === 'SELLER' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Merchant Controls</Text>
            <TouchableOpacity 
              style={styles.primaryAction}
              onPress={() => navigation.navigate('ListingUpload')}
            >
              <Text style={styles.primaryActionText}>📷 Create New Food Listing</Text>
            </TouchableOpacity>
            
            <View style={styles.metricsBox}>
              <Text style={styles.metricsTitle}>Annual Sales (DAC7 Node)</Text>
              <Text style={styles.metricsValue}>€0.00</Text>
              <Text style={styles.metricsStatus}>✓ Active • Report Snaps Synced</Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            {!showApplyForm ? (
              <View style={styles.applyPrompt}>
                <Text style={styles.applyTitle}>Become a Verified Seller</Text>
                <Text style={styles.applyText}>Register your commercial business to sell specialty foods across the EU. Captures DSA registration and DAC7 tax records.</Text>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => setShowApplyForm(true)}
                >
                  <Text style={styles.secondaryButtonText}>Start Seller Application</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formCard}>
                <Text style={styles.formHeader}>KYBC Compliance Application</Text>
                
                <TextInput
                  style={styles.formInput}
                  placeholder="Business Legal Name"
                  placeholderTextColor={theme.colors.textMuted}
                  value={businessName}
                  onChangeText={setBusinessName}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Contact Phone Number"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Trade Register Number (e.g. HRB 1234)"
                  placeholderTextColor={theme.colors.textMuted}
                  value={regNumber}
                  onChangeText={setRegNumber}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Tax Identification Number (TIN)"
                  placeholderTextColor={theme.colors.textMuted}
                  value={taxId}
                  onChangeText={setTaxId}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="VAT Number (Optional)"
                  placeholderTextColor={theme.colors.textMuted}
                  value={vat}
                  onChangeText={setVat}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Address Street"
                  placeholderTextColor={theme.colors.textMuted}
                  value={street}
                  onChangeText={setStreet}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="City"
                  placeholderTextColor={theme.colors.textMuted}
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Postal Code"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  value={postal}
                  onChangeText={setPostal}
                />

                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setSelfCertified(!selfCertified)}
                >
                  <View style={[styles.checkbox, selfCertified && styles.checkboxChecked]}>
                    {selfCertified && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>I self-certify compliance with EU consumer safety regulations.</Text>
                </TouchableOpacity>

                <View style={styles.formButtons}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowApplyForm(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.submitBtn} onPress={submitSellerApp}>
                    <Text style={styles.submitBtnText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Settings options list */}
        <View style={styles.settingsSection}>
          <TouchableOpacity 
            style={styles.settingsRow}
            onPress={() => navigation.navigate('GDPR')}
          >
            <Text style={styles.settingsLabel}>🛡️ GDPR privacy &amp; Consent Center</Text>
            <Text style={styles.arrow}>&rarr;</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow} onPress={handleLogout}>
            <Text style={[styles.settingsLabel, { color: theme.colors.danger }]}>🚪 Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyHeadings,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  form: {
    marginTop: 24,
    gap: 12,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  // Logged-in profile styles
  userCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatar: {
    fontSize: 48,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  userRole: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.secondary,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  metricsBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricsTitle: {
    fontSize: 11,
    fontWeight: '750',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  metricsValue: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.text,
    marginVertical: 6,
  },
  metricsStatus: {
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: '600',
  },
  // Apply prompt
  applyPrompt: {
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 115, 0.2)',
  },
  applyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  applyText: {
    fontSize: 11,
    color: '#5c584c',
    lineHeight: 16,
    marginVertical: 12,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '750',
  },
  // Form card
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  formHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkMark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  checkboxLabel: {
    fontSize: 11,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 15,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  cancelBtnText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
  },
  submitBtnText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '750',
  },
  settingsSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 24,
  },
  settingsRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  arrow: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
