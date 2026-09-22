import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { emitAlertCreated } from '../sockets/socketHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';
import { AlertSeverity, Role } from '@prisma/client';
import { calculateHaversineDistance } from '../utils/haversine';

const router = Router();

// GET active emergency alerts
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng } = req.query;

    const alerts = await prisma.alert.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    if (lat !== undefined && lng !== undefined) {
      const uLat = parseFloat(lat as string);
      const uLng = parseFloat(lng as string);

      const targetedAlerts = alerts.map((alert) => {
        const distanceKm = calculateHaversineDistance(uLat, uLng, alert.latitude, alert.longitude);
        return {
          ...alert,
          distanceFromUserKm: distanceKm,
          isUserInsideHazardZone: distanceKm <= alert.radiusKm,
        };
      });

      res.json({ alerts: targetedAlerts });
      return;
    }

    res.json({ alerts });
  } catch (error: any) {
    console.error('Fetch alerts error:', error);
    res.status(500).json({ error: 'Failed to retrieve emergency alerts' });
  }
});

// POST create emergency alert (Admin only)
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Only administrators can broadcast emergency alerts.' });
      return;
    }

    const { title, message, severity, latitude, longitude, radiusKm, expiresAt } = req.body;

    if (!title || !message || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        error: 'Title, message, latitude, and longitude are required to create an alert.',
      });
      return;
    }

    const validSeverity = (severity && Object.values(AlertSeverity).includes(severity))
      ? severity
      : AlertSeverity.WARNING;

    const alert = await prisma.alert.create({
      data: {
        title,
        message,
        severity: validSeverity,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusKm: radiusKm ? parseFloat(radiusKm) : 10.0,
        active: true,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Broadcast real-time Socket.IO alert
    emitAlertCreated({
      id: alert.id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      latitude: alert.latitude,
      longitude: alert.longitude,
      radiusKm: alert.radiusKm,
    });

    res.status(201).json({ message: 'Emergency alert broadcasted successfully', alert });
  } catch (error: any) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to broadcast emergency alert' });
  }
});

export default router;
