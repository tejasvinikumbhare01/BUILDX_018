import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { generateRescueId } from '../utils/idGenerator';
import { calculateRescuePriority } from '../utils/priorityCalculator';
import { findRecommendedResponders } from '../services/allocationService';
import { emitRescueCreated, emitRescueAssigned } from '../sockets/socketHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';
import { RescuePriority, RescueStatus, ResponderStatus, MissionStatus, Role } from '@prisma/client';

const router = Router();

// GET all rescue requests (optional filters: status, priority)
router.get('/', async (req, res): Promise<void> => {
  try {
    const { status, priority } = req.query;

    const where: any = {};
    if (status && Object.values(RescueStatus).includes(status as RescueStatus)) {
      where.status = status as RescueStatus;
    }
    if (priority && Object.values(RescuePriority).includes(priority as RescuePriority)) {
      where.priority = priority as RescuePriority;
    }

    const requests = await prisma.rescueRequest.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { reportedAt: 'desc' },
      ],
      include: {
        user: { select: { id: true, name: true, phone: true } },
        assignedTeam: true,
        missions: {
          include: { rescueTeam: true },
        },
      },
    });

    res.json({ requests });
  } catch (error: any) {
    console.error('Fetch rescue requests error:', error);
    res.status(500).json({ error: 'Failed to retrieve rescue requests' });
  }
});

// POST create rescue request with automated priority calculation
router.post('/', async (req, res): Promise<void> => {
  try {
    const {
      emergencyType,
      numberOfPeople,
      medicalEmergency,
      childrenCount,
      elderlyCount,
      vulnerableCount,
      description,
      latitude,
      longitude,
      accuracy,
      userId,
    } = req.body;

    if (!emergencyType || !description || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        error: 'Emergency type, description, latitude, and longitude are required.',
      });
      return;
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);
    const numPeople = numberOfPeople ? parseInt(numberOfPeople, 10) : 1;
    const isMedical = medicalEmergency === true || medicalEmergency === 'true';
    const numChildren = childrenCount ? parseInt(childrenCount, 10) : 0;
    const numElderly = elderlyCount ? parseInt(elderlyCount, 10) : 0;
    const numVulnerable = vulnerableCount ? parseInt(vulnerableCount, 10) : 0;

    // Calculate priority using real submitted parameters
    const calculatedPriority = calculateRescuePriority({
      emergencyType,
      numberOfPeople: numPeople,
      medicalEmergency: isMedical,
      childrenCount: numChildren,
      elderlyCount: numElderly,
      vulnerableCount: numVulnerable,
    });

    const rescueId = generateRescueId();

    const rescue = await prisma.rescueRequest.create({
      data: {
        id: rescueId,
        emergencyType,
        numberOfPeople: numPeople,
        medicalEmergency: isMedical,
        childrenCount: numChildren,
        elderlyCount: numElderly,
        vulnerableCount: numVulnerable,
        priority: calculatedPriority as RescuePriority,
        status: RescueStatus.PENDING,
        description,
        latitude: latNum,
        longitude: lonNum,
        accuracy: accuracy ? parseFloat(accuracy) : null,
        userId: userId || null,
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    // Query immediate recommended responders for the request
    const recommendations = await findRecommendedResponders(
      latNum,
      lonNum,
      emergencyType,
      calculatedPriority
    );

    // Broadcast real-time rescue event
    emitRescueCreated(rescue);

    res.status(201).json({
      message: 'Emergency rescue request registered successfully',
      rescue,
      recommendedResponders: recommendations.slice(0, 3),
    });
  } catch (error: any) {
    console.error('Create rescue request error:', error);
    res.status(500).json({ error: 'Failed to submit emergency rescue request' });
  }
});

// GET recommended responders for a specific rescue request
router.get('/:id/recommendations', async (req, res): Promise<void> => {
  try {
    const rescue = await prisma.rescueRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!rescue) {
      res.status(404).json({ error: 'Rescue request not found' });
      return;
    }

    const recommendations = await findRecommendedResponders(
      rescue.latitude,
      rescue.longitude,
      rescue.emergencyType,
      rescue.priority
    );

    res.json({ rescueId: rescue.id, recommendations });
  } catch (error: any) {
    console.error('Fetch recommendations error:', error);
    res.status(500).json({ error: 'Failed to calculate responder recommendations' });
  }
});

// POST assign rescue team to request (Admins & Responders)
router.post('/:id/assign', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { teamId, notes } = req.body;

    if (!teamId) {
      res.status(400).json({ error: 'teamId is required for assignment' });
      return;
    }

    const rescue = await prisma.rescueRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!rescue) {
      res.status(404).json({ error: 'Rescue request not found' });
      return;
    }

    const team = await prisma.rescueTeam.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      res.status(404).json({ error: 'Rescue team not found' });
      return;
    }

    // Update rescue request status to ASSIGNED
    const updatedRescue = await prisma.rescueRequest.update({
      where: { id: rescue.id },
      data: {
        status: RescueStatus.ASSIGNED,
        assignedTeamId: team.id,
      },
      include: {
        assignedTeam: true,
      },
    });

    // Mark team as DISPATCHED
    await prisma.rescueTeam.update({
      where: { id: team.id },
      data: { status: ResponderStatus.DISPATCHED },
    });

    // Create a mission record
    const mission = await prisma.rescueMission.create({
      data: {
        rescueRequestId: rescue.id,
        rescueTeamId: team.id,
        status: MissionStatus.DISPATCHED,
        notes: notes || `Dispatched to emergency: ${rescue.emergencyType}`,
      },
    });

    emitRescueAssigned(updatedRescue);

    res.json({
      message: 'Rescue team assigned successfully',
      rescue: updatedRescue,
      mission,
    });
  } catch (error: any) {
    console.error('Assign rescue team error:', error);
    res.status(500).json({ error: 'Failed to assign rescue team' });
  }
});

// PATCH update rescue status (e.g., IN_PROGRESS, COMPLETED)
router.patch('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    if (!status || !Object.values(RescueStatus).includes(status)) {
      res.status(400).json({ error: 'Valid rescue status is required' });
      return;
    }

    const updated = await prisma.rescueRequest.update({
      where: { id: req.params.id },
      data: { status },
      include: { assignedTeam: true },
    });

    if (status === RescueStatus.COMPLETED && updated.assignedTeamId) {
      await prisma.rescueTeam.update({
        where: { id: updated.assignedTeamId },
        data: { status: ResponderStatus.AVAILABLE },
      });
    }

    emitRescueAssigned(updated);

    res.json({ message: 'Rescue request status updated', rescue: updated });
  } catch (error: any) {
    console.error('Update rescue status error:', error);
    res.status(500).json({ error: 'Failed to update rescue status' });
  }
});

export default router;
