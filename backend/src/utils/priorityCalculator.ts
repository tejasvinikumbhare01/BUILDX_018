export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PriorityInput {
  emergencyType: string;
  numberOfPeople: number;
  medicalEmergency: boolean;
  childrenCount: number;
  elderlyCount: number;
  vulnerableCount: number;
}

/**
 * Calculates triage priority based on objective life-safety factors.
 */
export function calculateRescuePriority(input: PriorityInput): PriorityLevel {
  let score = 0;

  // Immediate life threats
  if (input.medicalEmergency) {
    score += 40;
  }

  // High hazard emergency types
  const typeLower = (input.emergencyType || '').toLowerCase();
  if (typeLower.includes('flood') || typeLower.includes('submerged') || typeLower.includes('drowning')) {
    score += 30;
  } else if (typeLower.includes('collapse') || typeLower.includes('trapped') || typeLower.includes('landslide')) {
    score += 35;
  } else if (typeLower.includes('fire') || typeLower.includes('smoke') || typeLower.includes('gas')) {
    score += 30;
  } else {
    score += 15;
  }

  // Vulnerable populations
  const vulnerableTotal = (input.childrenCount || 0) + (input.elderlyCount || 0) + (input.vulnerableCount || 0);
  score += Math.min(30, vulnerableTotal * 10);

  // Group scale
  if (input.numberOfPeople > 10) {
    score += 20;
  } else if (input.numberOfPeople > 4) {
    score += 10;
  } else if (input.numberOfPeople > 1) {
    score += 5;
  }

  if (score >= 65) {
    return 'CRITICAL';
  } else if (score >= 45) {
    return 'HIGH';
  } else if (score >= 25) {
    return 'MEDIUM';
  } else {
    return 'LOW';
  }
}
