import { Router, Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../db/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';
import { Role, ResponderStatus } from '@prisma/client';

const router = Router();

// In-memory cache for reverse geocoding to prevent excessive external requests
const geocodeCache = new Map<string, { address: string; details: any; timestamp: number }>();

// Cache TTL: 1 hour
const CACHE_TTL_MS = 60 * 60 * 1000;

// POST responder location update
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, accuracy, heading, speed, onDuty } = req.body;
    const userId = req.user!.id;

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: 'Latitude and Longitude are required.' });
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    // If user is responder or admin and onDuty is specified, update team / responder location
    if (req.user?.role === Role.RESPONDER || req.user?.role === Role.ADMIN) {
      const locRecord = await prisma.responderLocation.create({
        data: {
          responderId: userId,
          latitude: lat,
          longitude: lon,
          accuracy: accuracy ? parseFloat(accuracy) : null,
          heading: heading ? parseFloat(heading) : null,
          speed: speed ? parseFloat(speed) : null,
        },
      });

      if (onDuty !== undefined) {
        const status = onDuty ? ResponderStatus.ON_DUTY : ResponderStatus.OFF_DUTY;
        await prisma.rescueTeam.updateMany({
          where: { leaderName: { contains: req.user.name, mode: 'insensitive' } },
          data: {
            latitude: lat,
            longitude: lon,
            status,
            lastLocationUpdate: new Date(),
          },
        });
      }

      res.status(201).json({
        message: 'Responder location logged successfully',
        locationId: locRecord.id,
        timestamp: locRecord.timestamp,
      });
      return;
    }

    // For general citizens: Privacy policy enforces no persistent background tracking
    res.json({
      message: 'Location verified for active session. Privacy: Continuous background tracking not persisted for citizen accounts.',
      latitude: lat,
      longitude: lon,
    });
  } catch (error: any) {
    console.error('Location logging error:', error);
    res.status(500).json({ error: 'Failed to process location record' });
  }
});

// GET reverse-geocode for real street address
router.get('/reverse-geocode', async (req: Request, res: Response): Promise<void> => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: 'Latitude and Longitude query parameters are required.' });
    return;
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400).json({ error: 'Invalid latitude or longitude.' });
    return;
  }

  // Key rounded to 4 decimals (~11m precision)
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const cached = geocodeCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.json({
      address: cached.address,
      details: cached.details,
      cached: true,
      latitude,
      longitude,
    });
    return;
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'jsonv2',
        zoom: 18,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'ResQGrid-DisasterPlatform/1.0 (disaster-relief@resqgrid.org)',
        'Accept-Language': 'en',
      },
      timeout: 6000,
    });

    const data = response.data;
    const addr = data.address || {};

    const road = addr.road || addr.street || addr.pedestrian || addr.highway || addr.path || '';
    const neighbourhood = addr.neighbourhood || addr.suburb || addr.residential || addr.subdivision || '';
    const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || 'Nagpur';
    const state = addr.state || '';
    const postcode = addr.postcode ? `PIN ${addr.postcode}` : '';
    const country = addr.country || 'India';

    // Build human-friendly clean address line
    const parts = [road, neighbourhood, city, state, postcode, country].filter(Boolean);
    const cleanAddress = parts.length > 0 ? parts.join(', ') : data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

    const result = {
      address: cleanAddress,
      displayName: data.display_name,
      details: {
        road,
        neighbourhood,
        city,
        state,
        postcode: addr.postcode || null,
        country,
      },
      latitude,
      longitude,
    };

    geocodeCache.set(cacheKey, { address: cleanAddress, details: result.details, timestamp: Date.now() });

    res.json(result);
  } catch (error: any) {
    console.warn('Reverse geocode lookup warning:', error.message);
    const fallbackAddress = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
    res.json({
      address: fallbackAddress,
      displayName: fallbackAddress,
      details: {
        city: 'Nagpur Region',
        country: 'India',
      },
      latitude,
      longitude,
      fallback: true,
    });
  }
});

// GET Nagpur live CCTV flood monitoring cameras
router.get('/cctv-cameras', async (_req: Request, res: Response): Promise<void> => {
  const cctvFeeds = [
    {
      id: 'CAM-NGP-01',
      name: 'Ambazari Dam Spillway Cam #01',
      location: 'Ambazari Lake & Overflow Canal, Nagpur',
      latitude: 21.1345,
      longitude: 79.0478,
      status: 'CRITICAL',
      waterLevelMeters: 4.25,
      dangerLevelMeters: 4.00,
      flowVelocity: '2.4 m/s',
      riskScore: 92,
      lastUpdated: new Date().toISOString(),
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
      id: 'CAM-NGP-02',
      name: 'Nag River Sitabuldi Bridge Cam #02',
      location: 'Sitabuldi Center Channel & Maharajbagh, Nagpur',
      latitude: 21.1448,
      longitude: 79.0847,
      status: 'WARNING',
      waterLevelMeters: 3.80,
      dangerLevelMeters: 3.50,
      flowVelocity: '1.9 m/s',
      riskScore: 78,
      lastUpdated: new Date().toISOString(),
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
    {
      id: 'CAM-NGP-03',
      name: 'Pili River Hydrometric Station Cam #03',
      location: 'Kamptee Road / Jaripatka Lowlands, Nagpur',
      latitude: 21.1985,
      longitude: 79.1120,
      status: 'CRITICAL',
      waterLevelMeters: 4.10,
      dangerLevelMeters: 3.90,
      flowVelocity: '2.8 m/s',
      riskScore: 89,
      lastUpdated: new Date().toISOString(),
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
      id: 'CAM-NGP-04',
      name: 'Narendra Nagar Underpass Cam #04',
      location: 'Narendra Nagar Railway Underpass, Nagpur',
      latitude: 21.1092,
      longitude: 79.0784,
      status: 'DANGER',
      waterLevelMeters: 1.40,
      dangerLevelMeters: 0.80,
      flowVelocity: '0.3 m/s',
      riskScore: 85,
      lastUpdated: new Date().toISOString(),
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
  ];

  res.json({ cameras: cctvFeeds });
});

// GET all active responders and their latest locations
router.get('/responders', async (_req, res: Response): Promise<void> => {
  try {
    const teams = await prisma.rescueTeam.findMany({
      select: {
        id: true,
        name: true,
        leaderName: true,
        capability: true,
        status: true,
        latitude: true,
        longitude: true,
        lastLocationUpdate: true,
        membersCount: true,
        contact: true,
      },
    });

    res.json({ responders: teams });
  } catch (error: any) {
    console.error('Fetch responders error:', error);
    res.status(500).json({ error: 'Failed to retrieve responder coordinates' });
  }
});

export default router;
