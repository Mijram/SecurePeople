import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://10.0.2.2:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Socket.IO connected');
        this.socket?.emit('subscribe_reports');
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Socket.IO disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.warn('Socket.IO connection error:', error.message);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
