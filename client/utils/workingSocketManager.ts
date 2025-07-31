import { io, Socket } from 'socket.io-client';

class WorkingSocketManager {
  private static instance: WorkingSocketManager;
  private socket: Socket | null = null;
  private isConnecting = false;

  private constructor() {
    // Simplified constructor without problematic event listeners
  }

  public static getInstance(): WorkingSocketManager {
    if (!WorkingSocketManager.instance) {
      WorkingSocketManager.instance = new WorkingSocketManager();
    }
    return WorkingSocketManager.instance;
  }

  public getSocket(): Socket | null {
    // Return existing socket if connected
    if (this.socket?.connected) {
      return this.socket;
    }

    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      return this.socket;
    }

    this.createConnection();
    return this.socket;
  }

  private createConnection(): void {
    if (this.isConnecting) return;

    this.isConnecting = true;
    console.log('Creating socket connection...');
    
    try {
      this.socket = io('/', {
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnecting = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnecting = false;
      });

    } catch (error) {
      console.error('Error creating socket:', error);
      this.isConnecting = false;
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }
}

export default WorkingSocketManager;
