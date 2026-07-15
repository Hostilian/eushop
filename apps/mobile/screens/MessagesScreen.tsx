import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { theme } from '../lib/theme';

// Simulate API fetch
const fetchThreads = async (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate error state (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Failed to load messages');
      }
      // Return mock data
      resolve([
        {
          id: 'thread-1',
          seller: 'Brussels Praline Co.',
          item: 'Artisanal Belgian Chocolates',
          lastMessage: 'Hello! I have fresh Stroopwafels from Gouda ready for shipping.',
          time: 'Just Now',
          messages: [
            { sender: 'seller', text: 'Hi! Thank you for inquiring about our Belgian chocolates.' },
            { sender: 'buyer', text: 'Are they fresh? Do you ship to Germany?' },
            { sender: 'seller', text: 'Yes, they are made daily. We ship across the single market in refrigerated boxes. Delivery is usually 2 days.' },
            { sender: 'seller', text: 'Hello! I have fresh Stroopwafels from Gouda ready for shipping.' }
          ]
        },
        {
          id: 'thread-2',
          seller: 'Modena Olive & Vineyards',
          item: 'Aceto Balsamico DOP',
          lastMessage: 'Your order has been shipped via DHL Express.',
          time: '2h ago',
          messages: [
            { sender: 'buyer', text: 'Is the balsamic aged in oak casks?' },
            { sender: 'seller', text: 'Yes, fully matured for 12 years in oak and chestnut barrels.' },
            { sender: 'buyer', text: 'Great, I just placed an order.' },
            { sender: 'seller', text: 'Your order has been shipped via DHL Express.' }
          ]
        }
      ]);
    }, 1000); // Simulate network delay
  });
}

export default function MessagesScreen() {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchThreads();
        setThreads(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSendMessage = () => {
    if (!replyText || !activeThread) return;
    
    setThreads(prev => prev.map(t => {
      if (t.id === activeThread) {
        return {
          ...t,
          lastMessage: replyText,
          time: 'Just Now',
          messages: [...t.messages, { sender: 'buyer', text: replyText }]
        };
      }
      return t;
    }));
    setReplyText('');
  };

  const currentThread = threads.find(t => t.id === activeThread);

  if (activeThread && currentThread) {
    return (
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setActiveThread(null)} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.chatTitle}>{currentThread.seller}</Text>
            <Text style={styles.chatSub}>{currentThread.item}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.chatMessages} ref={(ref) => ref?.scrollToEnd({ animated: true })}>
          {currentThread.messages.map((m, idx) => {
            const isBuyer = m.sender === 'buyer';
            return (
              <View 
                key={idx} 
                style={[
                  styles.msgWrapper, 
                  isBuyer ? styles.msgRight : styles.msgLeft
                ]}
              >
                <View style={[styles.msgBubble, isBuyer ? styles.bubbleRight : styles.bubbleLeft]}>
                  <Text style={[styles.msgText, isBuyer ? styles.textRight : styles.textLeft]}>{m.text}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.textMuted}
            value={replyText}
            onChangeText={setReplyText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            setLoading(true);
            fetchThreads().then(setThreads).catch(setError).finally(() => setLoading(false));
          }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Conversations</Text>
          {threads.length > 0 ? (
            <View style={styles.threadList}>
              {threads.map(t => (
                <TouchableOpacity key={t.id} style={styles.threadCard} onPress={() => setActiveThread(t.id)}>
                  <View style={styles.threadInfo}>
                    <View style={styles.threadTop}>
                      <Text style={styles.threadName}>{t.seller}</Text>
                      <Text style={styles.threadTime}>{t.time}</Text>
                    </View>
                    <Text style={styles.threadItem}>{t.item}</Text>
                    <Text style={styles.threadLast} numberOfLines={1}>{t.lastMessage}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySub}>Start chatting with sellers and buyers</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 20,
    fontFamily: theme.typography.fontFamilyHeadings,
  },
  threadList: {
    gap: 12,
  },
  threadCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  threadInfo: {
    gap: 4,
  },
  threadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  threadTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  threadItem: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  threadLast: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 6,
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
  // Chat styles
  chatContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  chatHeader: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  chatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  chatSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  chatMessages: {
    padding: 16,
    gap: 12,
  },
  msgWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  msgLeft: {
    justifyContent: 'flex-start',
  },
  msgRight: {
    justifyContent: 'flex-end',
  },
  msgBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: theme.borderRadius.lg,
  },
  bubbleLeft: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bubbleRight: {
    backgroundColor: theme.colors.primary,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  textLeft: {
    color: theme.colors.text,
  },
  textRight: {
    color: '#fff',
  },
  chatInputRow: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
