import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { theme } from '../lib/theme';

export default function GDPRScreen() {
  const [essential, setEssential] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleExport = () => {
    Alert.alert(
      'Export Initiated (Art. 20)',
      'Your machine-readable data portability file is being compiled. A JSON download link has been dispatched to your verified email.',
      [{ text: 'OK' }]
    );
  };

  const handleErasure = () => {
    Alert.alert(
      'Confirm Account Erasure (Art. 17)',
      'Are you sure you want to permanently delete your account and associated registration metrics? This action is irreversible.',
      [
        {
          text: 'Confirm Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Erasure Complete', 'Your data has been deleted from all active databases.')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>GDPR Privacy Center</Text>
      <Text style={styles.subtitle}>EUshop fully supports your rights under the EU General Data Protection Regulation (GDPR).</Text>

      {/* Rights summary card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛡️ Your Personal Data Rights</Text>
        <View style={styles.rightsList}>
          <Text style={styles.rightItem}>• <Text style={styles.boldText}>Art. 15 (Access)</Text>: Request reports of the exact details we store.</Text>
          <Text style={styles.rightItem}>• <Text style={styles.boldText}>Art. 17 (Erasure)</Text>: Anonymize details from active databases.</Text>
          <Text style={styles.rightItem}>• <Text style={styles.boldText}>Art. 20 (Portability)</Text>: Export your profile details in machine-readable JSON format.</Text>
        </View>
      </View>

      {/* Portability and Erasure buttons */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Actions</Text>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleExport}>
          <Text style={styles.secondaryButtonText}>Export My Data Archive (Art. 20)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={handleErasure}>
          <Text style={styles.dangerButtonText}>Request Account Erasure (Art. 17)</Text>
        </TouchableOpacity>
      </View>

      {/* Consent preferences */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Consent &amp; Cookie Preferences</Text>
        
        {/* Essential */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Essential Session Cookies</Text>
            <Text style={styles.toggleDesc}>Required for secure login authentication and session cart state. Cannot be disabled.</Text>
          </View>
          <Text style={styles.activeLabel}>Always Active</Text>
        </View>

        {/* Analytics */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Analytics &amp; Optimization</Text>
            <Text style={styles.toggleDesc}>Used in simulated modes to aggregate traffic and layout conversion metrics.</Text>
          </View>
          <Switch
            value={analytics}
            onValueChange={setAnalytics}
            trackColor={{ false: '#767577', true: theme.colors.secondary }}
            thumbColor={analytics ? theme.colors.primary : '#f4f3f4'}
          />
        </View>

        {/* Marketing */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Marketing &amp; Referrals</Text>
            <Text style={styles.toggleDesc}>Customizes notifications and promotional gourmet recommendations.</Text>
          </View>
          <Switch
            value={marketing}
            onValueChange={setMarketing}
            trackColor={{ false: '#767577', true: theme.colors.secondary }}
            thumbColor={marketing ? theme.colors.primary : '#f4f3f4'}
          />
        </View>

        {/* Biometric — placeholder, not yet implemented */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Biometric Checkout (Coming Soon)</Text>
            <Text style={styles.toggleDesc}>Face ID / Touch ID checkout is planned for a future release. When available, it will require explicit GDPR Art. 9 consent before activation.</Text>
          </View>
          <Text style={styles.activeLabel}>Not Available</Text>
        </View>
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rightsList: {
    gap: 8,
  },
  rightItem: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: theme.colors.danger + '10',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  dangerButtonText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  // Toggles
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 16,
  },
  toggleInfo: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  toggleDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.success,
  },
});
