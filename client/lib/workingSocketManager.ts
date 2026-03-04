// client/lib/workingSocketManager.ts
import { io, Socket } from 'socket.io-client';

class WorkingSocketManager {
  private static instance: WorkingSocketManager;
  private socket: Socket | null = null;
  private isConnecting = false;
  private connectionKey = 'uncoverles-socket-session';
  private lastConnection = 0;
  private minConnectionInterval = 3000; // 🔴 Turunkan jadi 3 detik (dari 5 detik)
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    const lastConnectionTime = parseInt(sessionStorage.getItem(this.connectionKey) || '0');
    this.lastConnection = lastConnectionTime;

    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  public static getInstance(): WorkingSocketManager {
    if (!WorkingSocketManager.instance) {
      WorkingSocketManager.instance = new WorkingSocketManager();
    }
    return WorkingSocketManager.instance;
  }

  public getSocket(): Socket | null {
    const now = Date.now();

    if (this.socket?.connected) {
      console.log('Returning existing connected socket');
      this.reconnectAttempts = 0; // Reset attempts on successful connection
      return this.socket;
    }

    // 🔴 PERBAIKAN: Kurangi throttle untuk development
    if (now - this.lastConnection < this.minConnectionInterval && this.reconnectAttempts < 3) {
      console.log('Connection throttled - but allowing retry');
      // Allow retry anyway after short delay
      setTimeout(() => {
        this.createConnection();
      }, 1000);
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('Already connecting... waiting');
      return this.socket;
    }

    if (!this.socket) {
      this.createConnection();
    }

    return this.socket;
  }

// client/lib/workingSocketManager.ts

private createConnection(): void {
  if (this.isConnecting) return;

  this.isConnecting = true;
  this.lastConnection = Date.now();
  sessionStorage.setItem(this.connectionKey, this.lastConnection.toString());

  console.log('Creating socket connection...');

  // 🔴 PERBAIKAN: Kurangi reconnection attempts
  this.socket = io('/', {
    transports: ['polling', 'websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 3, // Turunkan dari 5
    reconnectionDelay: 2000, // Naikkan delay
    reconnectionDelayMax: 10000,
    timeout: 15000,
    forceNew: false,
    upgrade: true,
  });

  this.socket.on('connect', () => {
    console.log('Socket connected:', this.socket?.id);
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  });

  this.socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    this.isConnecting = false;
    
    // 🔴 PERBAIKAN: Handle server disconnect dengan lebih baik
    if (reason === 'io server disconnect') {
      // Jangan auto reconnect, tunggu manual
      console.log('Server disconnected. Will reconnect on next action.');
    }
  });

  this.socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    this.isConnecting = false;
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    } else {
      console.log('Max reconnect attempts reached');
      sessionStorage.removeItem(this.connectionKey);
      this.lastConnection = 0;
    }
  });
}

  public disconnect(): void {
    if (this.socket) {
      console.log('Manually disconnecting socket');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    sessionStorage.removeItem(this.connectionKey);
    this.lastConnection = 0;
    this.reconnectAttempts = 0;
  }
}

export default WorkingSocketManager;