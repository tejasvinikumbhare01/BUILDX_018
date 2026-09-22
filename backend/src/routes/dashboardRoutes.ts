import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { IncidentStatus, RescueStatus, ResponderStatus, Severity } from '@prisma/client';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // 1. Incidents counts by status & severity
    const totalIncidents = await prisma.incident.count();
    const activeIncidents = await prisma.incident.count({
      where: {
        status: { in: [IncidentStatus.REPORTED, IncidentStatus.VERIFIED, IncidentStatus.IN_PROGRESS] },
      },
    });
    const criticalIncidents = await prisma.incident.count({
      where: {
        status: { in: [IncidentStatus.REPORTED, IncidentStatus.VERIFIED, IncidentStatus.IN_PROGRESS] },
        severity: Severity.CRITICAL,
      },
    });

    // 2. Rescue requests
    const totalRescueRequests = await prisma.rescueRequest.count();
    const activeRescueRequests = await prisma.rescueRequest.count({
      where: {
        status: { in: [RescueStatus.PENDING, RescueStatus.ASSIGNED, RescueStatus.IN_PROGRESS] },
      },
    });
    const criticalRescueRequests = await prisma.rescueRequest.count({
      where: {
        status: { in: [RescueStatus.PENDING, RescueStatus.ASSIGNED, RescueStatus.IN_PROGRESS] },
        priority: 'CRITICAL',
      },
    });

    // 3. Responders & Teams online
    const totalTeams = await prisma.rescueTeam.count();
    const respondersOnline = await prisma.rescueTeam.count({
      where: {
        status: { in: [ResponderStatus.ON_DUTY, ResponderStatus.DISPATCHED] },
      },
    });
    const respondersAvailable = await prisma.rescueTeam.count({
      where: { status: ResponderStatus.AVAILABLE },
    });

    // 4. Active alerts
    const activeAlerts = await prisma.alert.count({
      where: { active: true },
    });

    // 5. Shelter capacities & occupancies (calculated from real database records)
    const shelters = await prisma.shelter.findMany();
    const totalShelterCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
    const totalShelterOccupancy = shelters.reduce((sum, s) => sum + s.currentOccupancy, 0);
    const shelterOccupancyRate =
      totalShelterCapacity > 0 ? Math.round((totalShelterOccupancy / totalShelterCapacity) * 100) : 0;

    // 6. Hospital availability
    const hospitals = await prisma.hospital.findMany();
    const totalEmergencyBeds = hospitals.reduce((sum, h) => sum + h.emergencyBeds, 0);
    const totalIcuBeds = hospitals.reduce((sum, h) => sum + h.icuBeds, 0);
    const totalAmbulances = hospitals.reduce((sum, h) => sum + h.ambulances, 0);

    // 7. Recent incidents for live ticker
    const recentIncidents = await prisma.incident.findMany({
      take: 5,
      orderBy: { reportedAt: 'desc' },
      select: {
        id: true,
        type: true,
        severity: true,
        description: true,
        reportedAt: true,
        status: true,
      },
    });

    // 8. Latest risk assessment
    const latestRisk = await prisma.riskPrediction.findFirst({
      orderBy: { calculatedAt: 'desc' },
    });

    res.json({
      timestamp: new Date().toISOString(),
      activeIncidents,
      totalIncidents,
      criticalIncidents,
      activeRescueRequests,
      totalRescueRequests,
      criticalRescueRequests,
      respondersOnline,
      respondersAvailable,
      totalTeams,
      activeAlerts,
      shelterCapacity: {
        totalCapacity: totalShelterCapacity,
        currentOccupancy: totalShelterOccupancy,
        availableCapacity: Math.max(0, totalShelterCapacity - totalShelterOccupancy),
        occupancyPercentage: shelterOccupancyRate,
      },
      hospitalAvailability: {
        totalEmergencyBeds,
        totalIcuBeds,
        totalAmbulances,
        operationalHospitals: hospitals.length,
      },
      latestRiskLevel: latestRisk ? latestRisk.riskLevel : 'MEDIUM',
      latestRiskScore: latestRisk ? latestRisk.riskScore : 54,
      recentIncidents,
    });
  } catch (error: any) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to aggregate dashboard metrics' });
  }
});

export default router;
