import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from '../config/env';
import { isPointInsideRadius } from '../utils/haversine';

let io: SocketIOServer | null = null;

// Track connected users and their latest reported positions
const connectedClients = new Map<string, { socketId: string; role?: string; lat?: number; lon?: number }>();

export function initSocketIO(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_role', (role: string) => {
      socket.join(`role:${role.toLowerCase()}`);
      console.log(`[Socket.IO] Client ${socket.id} joined role:${role.toLowerCase()}`);
    });

    // Client registers their live location for geo-targeted emergency alerts
    socket.on('client_location_heartbeat', (data: { lat: number; lon: number; role?: string }) => {
      connectedClients.set(socket.id, {
        socketId: socket.id,
        role: data.role,
        lat: data.lat,
        lon: data.lon,
      });
    });

    // Responder live tracking stream
    socket.on('responder_location_stream', (data: {
      responderId: string;
      name: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
      heading?: number;
      speed?: number;
      status: string;
    }) => {
      // Broadcast live responder location to admins and tactical map
      if (io) {
        io.emit('responder.location.updated', {
          ...data,
          lastUpdated: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', () => {
      connectedClients.delete(socket.id);
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet!');
  }
  return io;
}

export function emitIncidentCreated(incident: any) {
  if (io) {
    io.emit('incident.created', incident);
  }
}

export function emitIncidentUpdated(incident: any) {
  if (io) {
    io.emit('incident.updated', incident);
  }
}

export function emitRescueCreated(rescue: any) {
  if (io) {
    io.emit('rescue.created', rescue);
    io.to('role:admin').to('role:responder').emit('notification.created', {
      title: `Emergency Rescue Request (${rescue.priority})`,
      message: `${rescue.emergencyType} - ${rescue.numberOfPeople} people need rescue.`,
      type: 'RESCUE',
      data: rescue,
    });
  }
}

export function emitRescueAssigned(rescue: any) {
  if (io) {
    io.emit('rescue.assigned', rescue);
    io.emit('rescue.updated', rescue);
  }
}

export function emitAlertCreated(alert: {
  id: string;
  title: string;
  message: string;
  severity: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}) {
  if (!io) return;

  // Broadcast to all clients
  io.emit('alert.created', alert);

  // Send high-priority alert notification to users specifically inside the affected area
  connectedClients.forEach((client) => {
    if (client.lat !== undefined && client.lon !== undefined) {
      const isInside = isPointInsideRadius(
        client.lat,
        client.lon,
        alert.latitude,
        alert.longitude,
        alert.radiusKm
      );

      if (isInside) {
        io?.to(client.socketId).emit('targeted.alert.warning', {
          ...alert,
          targeted: true,
          alertReason: 'You are currently inside the hazardous perimeter.',
        });
      }
    }
  });
}

export function emitRiskUpdated(risk: any) {
  if (io) {
    io.emit('risk.updated', risk);
  }
}
