import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { calculateHaversineDistance } from '../utils/haversine';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// GET all shelters
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const shelters = await prisma.shelter.findMany({
      orderBy: { name: 'asc' },
    });

    const enriched = shelters.map((s) => ({
      ...s,
      availableCapacity: Math.max(0, s.capacity - s.currentOccupancy),
      occupancyPercentage: Math.round((s.currentOccupancy / s.capacity) * 100),
    }));

    res.json({ shelters: enriched });
  } catch (error: any) {
    console.error('Fetch shelters error:', error);
    res.status(500).json({ error: 'Failed to retrieve shelters' });
  }
});

// GET nearby shelters with physical Haversine distance from given coordinates
router.get('/nearby', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radiusKm } = req.query;

    if (lat === undefined || lng === undefined) {
      res.status(400).json({ error: 'Latitude (lat) and Longitude (lng) query parameters are required.' });
      return;
    }

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const maxRadius = radiusKm ? parseFloat(radiusKm as string) : 50; // default 50km radius

    const shelters = await prisma.shelter.findMany();

    const withDistances = shelters
      .map((shelter) => {
        const distanceKm = calculateHaversineDistance(userLat, userLng, shelter.latitude, shelter.longitude);
        return {
          ...shelter,
          distanceKm,
          availableCapacity: Math.max(0, shelter.capacity - shelter.currentOccupancy),
          occupancyPercentage: Math.round((shelter.currentOccupancy / shelter.capacity) * 100),
        };
      })
      .filter((s) => s.distanceKm <= maxRadius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ shelters: withDistances });
  } catch (error: any) {
    console.error('Fetch nearby shelters error:', error);
    res.status(500).json({ error: 'Failed to calculate nearby shelters' });
  }
});

// POST create or update shelter (Admin only)
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Only administrators can register shelters.' });
      return;
    }

    const {
      name,
      latitude,
      longitude,
      capacity,
      currentOccupancy,
      medicalAvailable,
      foodAvailable,
      waterAvailable,
      contact,
      address,
      status,
    } = req.body;

    const shelter = await prisma.shelter.create({
      data: {
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        capacity: parseInt(capacity, 10),
        currentOccupancy: currentOccupancy ? parseInt(currentOccupancy, 10) : 0,
        medicalAvailable: medicalAvailable !== false,
        foodAvailable: foodAvailable !== false,
        waterAvailable: waterAvailable !== false,
        contact,
        address,
        status: status || 'ACTIVE',
      },
    });

    res.status(201).json({ message: 'Shelter created successfully', shelter });
  } catch (error: any) {
    console.error('Create shelter error:', error);
    res.status(500).json({ error: 'Failed to create shelter' });
  }
});

export default router;
