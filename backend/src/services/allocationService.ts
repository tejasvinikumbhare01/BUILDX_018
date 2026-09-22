import { prisma } from '../db/prisma';
import { calculateHaversineDistance } from '../utils/haversine';
import { ResponderStatus } from '@prisma/client';

export interface AllocationRecommendation {
  team: {
    id: string;
    name: string;
    leaderName: string;
    contact: string;
    capability: string;
    status: ResponderStatus;
    latitude: number | null;
    longitude: number | null;
    membersCount: number;
  };
  distanceKm: number;
  matchScore: number;
  capabilityMatched: boolean;
  reason: string;
}

/**
 * Multi-criteria responder allocation engine:
 * Evaluates physical distance, capability matching to disaster emergency type,
 * availability status, and urgency.
 */
export async function findRecommendedResponders(
  latitude: number,
  longitude: number,
  emergencyType: string,
  priority: string
): Promise<AllocationRecommendation[]> {
  const teams = await prisma.rescueTeam.findMany({
    where: {
      status: { in: [ResponderStatus.AVAILABLE, ResponderStatus.ON_DUTY] },
    },
  });

  const typeLower = (emergencyType || '').toLowerCase();

  const scoredTeams: AllocationRecommendation[] = teams.map((team) => {
    let distanceKm = 999;
    if (team.latitude != null && team.longitude != null) {
      distanceKm = calculateHaversineDistance(latitude, longitude, team.latitude, team.longitude);
    }

    let capabilityMatched = false;
    const capabilityLower = (team.capability || '').toLowerCase();

    if (
      (typeLower.includes('flood') || typeLower.includes('water') || typeLower.includes('drown')) &&
      capabilityLower.includes('flood')
    ) {
      capabilityMatched = true;
    } else if (
      (typeLower.includes('med') || typeLower.includes('injur') || typeLower.includes('cardiac')) &&
      (capabilityLower.includes('med') || capabilityLower.includes('triage'))
    ) {
      capabilityMatched = true;
    } else if (
      (typeLower.includes('trap') || typeLower.includes('collaps') || typeLower.includes('landslide')) &&
      (capabilityLower.includes('search') || capabilityLower.includes('extrication'))
    ) {
      capabilityMatched = true;
    } else if (
      (typeLower.includes('fire') || typeLower.includes('smoke') || typeLower.includes('gas') || typeLower.includes('hazmat')) &&
      (capabilityLower.includes('fire') || capabilityLower.includes('hazmat'))
    ) {
      capabilityMatched = true;
    }

    // Distance Score: 100 points for 0 km, decaying by 10 points per km
    const distanceScore = Math.max(0, 100 - distanceKm * 10);

    // Capability Score: 50 bonus points
    const capabilityScore = capabilityMatched ? 50 : 10;

    // Status Score: ON_DUTY is primed for instant response (+20)
    const statusScore = team.status === ResponderStatus.ON_DUTY ? 20 : 10;

    // Priority Urgency Weight
    const priorityWeight = priority === 'CRITICAL' ? 1.5 : priority === 'HIGH' ? 1.2 : 1.0;

    const totalScore = Math.round((distanceScore + capabilityScore + statusScore) * priorityWeight);

    let reason = `${distanceKm} km away. `;
    if (capabilityMatched) {
      reason += `Specialized capability matches "${emergencyType}". `;
    } else {
      reason += `General emergency response capability. `;
    }
    reason += `Status: ${team.status}.`;

    return {
      team: {
        id: team.id,
        name: team.name,
        leaderName: team.leaderName,
        contact: team.contact,
        capability: team.capability,
        status: team.status,
        latitude: team.latitude,
        longitude: team.longitude,
        membersCount: team.membersCount,
      },
      distanceKm,
      matchScore: totalScore,
      capabilityMatched,
      reason,
    };
  });

  // Sort descending by matchScore
  return scoredTeams.sort((a, b) => b.matchScore - a.matchScore);
}
