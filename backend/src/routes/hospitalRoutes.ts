import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { calculateHaversineDistance } from '../utils/haversine';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// GET all hospitals
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const hospitals = await prisma.hospital.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({ hospitals });
  } catch (error: any) {
    console.error('Fetch hospitals error:', error);
    res.status(500).json({ error: 'Failed to retrieve hospitals' });
  }
});

// GET nearby hospitals sorted by physical Haversine distance
router.get('/nearby', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radiusKm } = req.query;

    if (lat === undefined || lng === undefined) {
      res.status(400).json({ error: 'Latitude (lat) and Longitude (lng) query parameters are required.' });
      return;
    }

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const maxRadius = radiusKm ? parseFloat(radiusKm as string) : 50;

    const hospitals = await prisma.hospital.findMany();

    const withDistances = hospitals
      .map((hospital) => {
        const distanceKm = calculateHaversineDistance(userLat, userLng, hospital.latitude, hospital.longitude);
        return {
          ...hospital,
          distanceKm,
        };
      })
      .filter((h) => h.distanceKm <= maxRadius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ hospitals: withDistances });
  } catch (error: any) {
    console.error('Fetch nearby hospitals error:', error);
    res.status(500).json({ error: 'Failed to calculate nearby hospitals' });
  }
});

// POST create hospital (Admin only)
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Only administrators can register hospitals.' });
      return;
    }

    const {
      name,
      latitude,
      longitude,
      emergencyBeds,
      icuBeds,
      ambulances,
      contact,
      address,
      status,
    } = req.body;

    const hospital = await prisma.hospital.create({
      data: {
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        emergencyBeds: parseInt(emergencyBeds, 10),
        icuBeds: parseInt(icuBeds, 10),
        ambulances: parseInt(ambulances, 10),
        contact,
        address,
        status: status || 'OPERATIONAL',
      },
    });

    res.status(201).json({ message: 'Hospital registered successfully', hospital });
  } catch (error: any) {
    console.error('Create hospital error:', error);
    res.status(500).json({ error: 'Failed to register hospital' });
  }
});

export default router;
