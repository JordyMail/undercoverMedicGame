import { io, Socket } from 'socket.io-client';

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private isConnecting = false;
  private connectionKey = 'uncoverles-socket-session';
  private lastConnection = 0;
  private minConnectionInterval = 5000; // Minimum 5 seconds between connections

  private constructor() {
    // Check if we recently made a connection
    const lastConnectionTime = parseInt(sessionStorage.getItem(this.connectionKey) || '0');
    this.lastConnection = lastConnectionTime;

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });

    // Clean up on visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Don't disconnect when tab is hidden, just mark as inactive
        console.log('Page hidden - socket remains connected');
      }
    });
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public getSocket(): Socket | null {
    const now = Date.now();

    // Return existing socket if connected
    if (this.socket?.connected) {
      console.log('Returning existing connected socket');
      return this.socket;
    }

    // Prevent too frequent connections
    if (now - this.lastConnection < this.minConnectionInterval) {
      console.log('Connection throttled - too recent, returning existing socket');
      return this.socket;
    }

    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.log('Already connecting... waiting');
      return this.socket;
    }

    // Only create if we don't have a socket at all
    if (!this.socket) {
      this.createConnection();
    }

    return this.socket;
  }

  private createConnection(): void {
    if (this.isConnecting) return;

    this.isConnecting = true;
    this.lastConnection = Date.now();
    sessionStorage.setItem(this.connectionKey, this.lastConnection.toString());

    console.log('Creating new socket connection...');

    this.socket = io('/', {
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      autoConnect: true,
      reconnection: true, // Enable reconnection with limits
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 10000, // Reduce timeout to 10 seconds
      forceNew: false, // Don't force new connection
      upgrade: true, // Allow transport upgrades
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully:', this.socket?.id);
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnecting = false;
      // Clear the session to allow retry after a shorter delay
      setTimeout(() => {
        sessionStorage.removeItem(this.connectionKey);
        this.lastConnection = 0;
      }, 5000);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      this.isConnecting = false;
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
  }

  public forceReconnect(): void {
    this.disconnect();
    // Wait a bit before reconnecting
    setTimeout(() => {
      this.getSocket();
    }, 1000);
  }
}

export default SocketManager;
