import { Router, Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../db/prisma';
import { calculateHaversineDistance } from '../utils/haversine';
import { IncidentStatus, IncidentType } from '@prisma/client';

const router = Router();

router.get('/evacuation', async (req: Request, res: Response): Promise<void> => {
  const { originLat, originLng, destLat, destLng, shelterId } = req.query;

  if (
    originLat === undefined ||
    originLng === undefined ||
    (destLat === undefined && !shelterId)
  ) {
    res.status(400).json({
      error: 'originLat, originLng, and destination coordinates (or shelterId) are required.',
    });
    return;
  }

  const startLat = parseFloat(originLat as string);
  const startLng = parseFloat(originLng as string);

  let targetLat: number;
  let targetLng: number;
  let targetName = 'Designated Safe Zone';

  if (shelterId) {
    const shelter = await prisma.shelter.findUnique({
      where: { id: shelterId as string },
    });
    if (!shelter) {
      res.status(404).json({ error: 'Selected shelter destination not found.' });
      return;
    }
    targetLat = shelter.latitude;
    targetLng = shelter.longitude;
    targetName = shelter.name;
  } else {
    targetLat = parseFloat(destLat as string);
    targetLng = parseFloat(destLng as string);
  }

  try {
    // 1. Fetch active verified road blockages & critical hazards to assess route safety
    const hazards = await prisma.incident.findMany({
      where: {
        status: { in: [IncidentStatus.VERIFIED, IncidentStatus.IN_PROGRESS] },
        type: { in: [IncidentType.ROAD_BLOCKAGE, IncidentType.FLOOD, IncidentType.LANDSLIDE] },
      },
    });

    // 2. Query OSRM (OpenStreetMap Routing Engine)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${targetLng},${targetLat}?overview=full&geometries=geojson&steps=true`;
    const response = await axios.get(osrmUrl, { timeout: 8000 });

    if (!response.data || !response.data.routes || response.data.routes.length === 0) {
      res.status(502).json({ error: 'Routing engine could not calculate a road network path.' });
      return;
    }

    const primaryRoute = response.data.routes[0];
    const coordinates: [number, number][] = primaryRoute.geometry.coordinates; // [lng, lat]
    const distanceKm = Math.round((primaryRoute.distance / 1000) * 100) / 100;
    const durationMin = Math.round(primaryRoute.duration / 60);

    // 3. Inspect route geometry against known hazard points
    const nearbyHazards: Array<{ id: string; type: string; description: string; distanceToRouteKm: number }> = [];

    hazards.forEach((hazard) => {
      // Check distance from hazard to any route coordinate segment
      let minDistanceToRoute = 999;
      for (const coord of coordinates) {
        const d = calculateHaversineDistance(hazard.latitude, hazard.longitude, coord[1], coord[0]);
        if (d < minDistanceToRoute) {
          minDistanceToRoute = d;
        }
      }

      // If hazard is within 300 meters of the path
      if (minDistanceToRoute <= 0.3) {
        nearbyHazards.push({
          id: hazard.id,
          type: hazard.type,
          description: hazard.description,
          distanceToRouteKm: Math.round(minDistanceToRoute * 1000) / 1000,
        });
      }
    });

    const isBlockedRoadDetected = nearbyHazards.some(
      (h) => h.type === IncidentType.ROAD_BLOCKAGE || h.type === IncidentType.FLOOD
    );

    res.json({
      success: true,
      origin: { latitude: startLat, longitude: startLng },
      destination: { name: targetName, latitude: targetLat, longitude: targetLng },
      distanceKm,
      durationMin,
      geometry: primaryRoute.geometry, // GeoJSON coordinates [[lng, lat], ...]
      isRouteVerifiedSafe: !isBlockedRoadDetected,
      hazardWarning: isBlockedRoadDetected
        ? 'CAUTION: Active road blockage or flood detected along or near this evacuation corridor. Review detour warnings.'
        : 'Route corridor is clear of verified hazards based on current real-time incident reports.',
      hazardsFound: nearbyHazards,
      steps: primaryRoute.legs?.[0]?.steps?.map((s: any) => ({
        instruction: s.maneuver?.type + ' ' + (s.name || ''),
        distance: s.distance,
        duration: s.duration,
      })) || [],
    });
  } catch (error: any) {
    console.error('Evacuation routing error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve real-time evacuation route from routing service.',
    });
  }
});

export default router;
