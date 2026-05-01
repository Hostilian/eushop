import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>Not Logged In</Text>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login or Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionLabel}>My Listings</Text>
          <Text style={styles.optionArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionLabel}>My Orders</Text>
          <Text style={styles.optionArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionLabel}>My Reviews</Text>
          <Text style={styles.optionArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionLabel}>Settings</Text>
          <Text style={styles.optionArrow}>→</Text>
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
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  loginButtonText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 0,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  optionArrow: {
    fontSize: 18,
    color: '#9ca3af',
  },
});
