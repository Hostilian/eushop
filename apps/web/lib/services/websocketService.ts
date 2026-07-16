"use client";

import { Message } from './chatService';

type WebSocketEventCallback = (data: any) => void;

type TypingEvent = {
  conversationId: string;
  userId: string;
  typing: boolean;
};

type ReadEvent = {
  conversationId: string;
  userId: string;
};

class WebSocketService {
  private socket: WebSocket | null = null;
  private stompClient: any = null;
  private connected: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private resolveConnection: (() => void) | null = null;
  private rejectConnection: ((error: Error) => void) | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  private messageCallbacks: WebSocketEventCallback[] = [];
  private typingCallbacks: WebSocketEventCallback[] = [];
  private readCallbacks: WebSocketEventCallback[] = [];
  private reactionCallbacks: WebSocketEventCallback[] = [];
  private connectionCallbacks: WebSocketEventCallback[] = [];
  private errorCallbacks: WebSocketEventCallback[] = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize WebSocket connection
   */
  private initialize(): void {
    this.connectionPromise = new Promise((resolve, reject) => {
      this.resolveConnection = resolve;
      this.rejectConnection = reject;
    });

    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  private connect(): void {
    if (typeof window === 'undefined') return;

    const token = this.getAuthToken();
    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    // Use SockJS for fallback support
    const socketUrl = this.getWebSocketUrl();
    this.socket = new WebSocket(socketUrl);

    // @ts-expect-error - Stomp is supplied by the host page until the client is migrated.
    this.stompClient = Stomp.over(this.socket);

    this.stompClient.connect(
      { Authorization: `Bearer ${token}` },
      () => this.onConnect(),
      (error: any) => this.handleConnectionError(error)
    );
  }

  /**
   * Get WebSocket URL
   */
  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') return '';

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = apiUrl.replace(/^https?:\/\//, '');

    return `${wsProtocol}//${host}/ws`;
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Try to get token from cookies (HTTP-only cookie)
    const cookieMatch = document.cookie.match(/token=([^;]+)/);
    if (cookieMatch) {
      return cookieMatch[1];
    }

    // Fallback to localStorage (should not be used in production)
    if (localStorage.getItem('token')) {
      return localStorage.getItem('token');
    }

    return null;
  }

  /**
   * Handle successful connection
   */
  private onConnect(): void {
    this.connected = true;
    this.reconnectAttempts = 0;

    // Subscribe to user-specific queues
    this.subscribeToMessages();
    this.subscribeToTyping();
    this.subscribeToReadReceipts();
    this.subscribeToReactions();

    // Notify connection callbacks
    this.connectionCallbacks.forEach(callback => callback({ connected: true }));

    if (this.resolveConnection) {
      this.resolveConnection();
      this.resolveConnection = null;
    }
  }

  /**
   * Subscribe to message queue
   */
  private subscribeToMessages(): void {
    if (!this.stompClient || !this.connected) return;

    this.stompClient.subscribe('/user/queue/messages', (message: any) => {
      try {
        const messageData = JSON.parse(message.body);
        this.messageCallbacks.forEach(callback => callback(messageData));
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  }

  /**
   * Subscribe to typing indicators
   */
  private subscribeToTyping(): void {
    if (!this.stompClient || !this.connected) return;

    this.stompClient.subscribe('/user/queue/typing', (message: any) => {
      try {
        const typingData = JSON.parse(message.body);
        this.typingCallbacks.forEach(callback => callback(typingData));
      } catch (error) {
        console.error('Error parsing typing event:', error);
      }
    });
  }

  /**
   * Subscribe to read receipts
   */
  private subscribeToReadReceipts(): void {
    if (!this.stompClient || !this.connected) return;

    this.stompClient.subscribe('/user/queue/read', (message: any) => {
      try {
        const readData = JSON.parse(message.body);
        this.readCallbacks.forEach(callback => callback(readData));
      } catch (error) {
        console.error('Error parsing read event:', error);
      }
    });
  }

  /**
   * Subscribe to reactions
   */
  private subscribeToReactions(): void {
    if (!this.stompClient || !this.connected) return;

    this.stompClient.subscribe('/user/queue/reactions', (message: any) => {
      try {
        const reactionData = JSON.parse(message.body);
        this.reactionCallbacks.forEach(callback => callback(reactionData));
      } catch (error) {
        console.error('Error parsing reaction event:', error);
      }
    });
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: any): void {
    console.error('WebSocket error:', error);
    this.connected = false;

    // Notify error callbacks
    this.errorCallbacks.forEach(callback => callback({ error }));

    if (this.rejectConnection) {
      this.rejectConnection(new Error('WebSocket connection failed'));
      this.rejectConnection = null;
    }

    // Attempt to reconnect
    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    setTimeout(() => {
      console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  /**
   * Send a message via WebSocket
   * @param conversationId The conversation ID
   * @param content The message content
   */
  public async sendMessage(conversationId: string, content: string): Promise<void> {
    await this.ensureConnected();

    if (!this.stompClient || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    this.stompClient.send(
      '/app/chat.send',
      {},
      JSON.stringify({ conversationId, content })
    );
  }

  /**
   * Send typing indicator
   * @param conversationId The conversation ID
   * @param typing Whether the user is typing
   */
  public async sendTyping(conversationId: string, typing: boolean): Promise<void> {
    await this.ensureConnected();

    if (!this.stompClient || !this.connected) return;

    this.stompClient.send(
      '/app/chat.typing',
      {},
      JSON.stringify({ conversationId, typing })
    );
  }

  /**
   * Send read receipt
   * @param conversationId The conversation ID
   */
  public async sendReadReceipt(conversationId: string): Promise<void> {
    await this.ensureConnected();

    if (!this.stompClient || !this.connected) return;

    this.stompClient.send(
      '/app/chat.read',
      {},
      JSON.stringify({ conversationId })
    );
  }

  /**
   * Send reaction to a message
   * @param messageId The message ID
   * @param reaction The reaction emoji
   */
  public async sendReaction(messageId: string, reaction: string): Promise<void> {
    await this.ensureConnected();

    if (!this.stompClient || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    this.stompClient.send(
      '/app/chat.react',
      {},
      JSON.stringify({ messageId, reaction })
    );
  }

  /**
   * Ensure WebSocket is connected
   */
  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      try {
        await this.connectionPromise;
      } catch (error) {
        console.error('Failed to connect:', error);
        throw error;
      }
    }
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Register message callback
   * @param callback The callback function
   */
  public onMessage(callback: WebSocketEventCallback): void {
    this.messageCallbacks.push(callback);
  }

  /**
   * Register typing callback
   * @param callback The callback function
   */
  public onTyping(callback: WebSocketEventCallback): void {
    this.typingCallbacks.push(callback);
  }

  /**
   * Register read receipt callback
   * @param callback The callback function
   */
  public onRead(callback: WebSocketEventCallback): void {
    this.readCallbacks.push(callback);
  }

  /**
   * Register reaction callback
   * @param callback The callback function
   */
  public onReaction(callback: WebSocketEventCallback): void {
    this.reactionCallbacks.push(callback);
  }

  /**
   * Register connection callback
   * @param callback The callback function
   */
  public onConnection(callback: WebSocketEventCallback): void {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Register error callback
   * @param callback The callback function
   */
  public onError(callback: WebSocketEventCallback): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Remove message callback
   * @param callback The callback function to remove
   */
  public offMessage(callback: WebSocketEventCallback): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Remove typing callback
   * @param callback The callback function to remove
   */
  public offTyping(callback: WebSocketEventCallback): void {
    this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Remove read callback
   * @param callback The callback function to remove
   */
  public offRead(callback: WebSocketEventCallback): void {
    this.readCallbacks = this.readCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Remove reaction callback
   * @param callback The callback function to remove
   */
  public offReaction(callback: WebSocketEventCallback): void {
    this.reactionCallbacks = this.reactionCallbacks.filter(cb => cb !== callback);
  }

  public offConnection(callback: WebSocketEventCallback): void {
    this.connectionCallbacks = this.connectionCallbacks.filter(
      cb => cb !== callback
    );
  }

  public offError(callback: WebSocketEventCallback): void {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.stompClient = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
