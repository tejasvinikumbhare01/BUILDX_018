import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { generateIncidentId } from '../utils/idGenerator';
import { emitIncidentCreated, emitIncidentUpdated } from '../sockets/socketHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { IncidentType, Severity, IncidentStatus, Role } from '@prisma/client';

const router = Router();

// GET all incidents (optional query params: status, type, minLat, maxLat, minLng, maxLng)
router.get('/', async (req, res): Promise<void> => {
  try {
    const { status, type, severity } = req.query;

    const where: any = {};
    if (status && Object.values(IncidentStatus).includes(status as IncidentStatus)) {
      where.status = status as IncidentStatus;
    }
    if (type && Object.values(IncidentType).includes(type as IncidentType)) {
      where.type = type as IncidentType;
    }
    if (severity && Object.values(Severity).includes(severity as Severity)) {
      where.severity = severity as Severity;
    }

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { reportedAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    res.json({ incidents });
  } catch (error: any) {
    console.error('Fetch incidents error:', error);
    res.status(500).json({ error: 'Failed to retrieve incidents' });
  }
});

// GET single incident by ID
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        damageAssessments: true,
      },
    });

    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    res.json({ incident });
  } catch (error: any) {
    console.error('Fetch incident error:', error);
    res.status(500).json({ error: 'Failed to retrieve incident details' });
  }
});

// POST report incident (supports multipart/form-data with photo or JSON)
router.post(
  '/',
  upload.single('photo'),
  async (req: any, res: Response): Promise<void> => {
    try {
      const {
        type,
        severity,
        description,
        latitude,
        longitude,
        accuracy,
        address,
        peopleAffected,
        rescueRequired,
        userId,
      } = req.body;

      if (!type || !description || latitude === undefined || longitude === undefined) {
        res.status(400).json({
          error: 'Incident type, description, latitude, and longitude are required.',
        });
        return;
      }

      const latNum = parseFloat(latitude);
      const lonNum = parseFloat(longitude);
      const accNum = accuracy ? parseFloat(accuracy) : null;
      const affectedNum = peopleAffected ? parseInt(peopleAffected, 10) : 1;
      const needRescue = rescueRequired === true || rescueRequired === 'true';

      const incidentId = generateIncidentId();

      let photoUrl: string | null = null;
      if (req.file) {
        photoUrl = `/uploads/${req.file.filename}`;
      }

      const validSeverity = (severity && Object.values(Severity).includes(severity as Severity))
        ? (severity as Severity)
        : Severity.MEDIUM;

      const validType = Object.values(IncidentType).includes(type as IncidentType)
        ? (type as IncidentType)
        : IncidentType.OTHER;

      const incident = await prisma.incident.create({
        data: {
          id: incidentId,
          type: validType,
          severity: validSeverity,
          description,
          latitude: latNum,
          longitude: lonNum,
          accuracy: accNum,
          address: address || null,
          photoUrl,
          peopleAffected: affectedNum,
          rescueRequired: needRescue,
          userId: userId || null,
          status: IncidentStatus.REPORTED,
        },
      });

      // Broadcast real-time incident event
      emitIncidentCreated(incident);

      res.status(201).json({
        message: 'Incident reported successfully',
        incident,
      });
    } catch (error: any) {
      console.error('Report incident error:', error);
      res.status(500).json({ error: 'Failed to record incident report' });
    }
  }
);

// PATCH update incident status / severity (Admins & Responders)
router.patch('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, severity, description } = req.body;

    const data: any = {};
    if (status && Object.values(IncidentStatus).includes(status)) {
      data.status = status;
    }
    if (severity && Object.values(Severity).includes(severity)) {
      data.severity = severity;
    }
    if (description) {
      data.description = description;
    }

    const updated = await prisma.incident.update({
      where: { id: req.params.id },
      data,
    });

    emitIncidentUpdated(updated);

    res.json({ message: 'Incident updated successfully', incident: updated });
  } catch (error: any) {
    console.error('Update incident error:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

export default router;
