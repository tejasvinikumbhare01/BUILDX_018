import { io, Socket } from 'socket.io-client';

const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
export const SOCKET_SERVER_URL = `http://${host}:5000`;


class SocketService {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to ResQGrid Real-Time Socket Server');
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from ResQGrid Socket Server');
      });
    }

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinRole(role: string): void {
    if (this.socket) {
      this.socket.emit('join_role', role);
    }
  }

  public sendLocationHeartbeat(lat: number, lon: number, role?: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('client_location_heartbeat', { lat, lon, role });
    }
  }

  public streamResponderLocation(data: {
    responderId: string;
    name: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    status: string;
  }): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('responder_location_stream', data);
    }
  }
}

export const socketService = new SocketService();
