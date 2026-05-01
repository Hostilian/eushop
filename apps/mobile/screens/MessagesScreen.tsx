import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emptyState}>No messages yet</Text>
        <Text style={styles.emptyStateSubtext}>Start chatting with sellers and buyers</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
