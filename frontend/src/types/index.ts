export type UserRole = 'CITIZEN' | 'RESPONDER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export type IncidentType =
  | 'FLOOD'
  | 'FIRE'
  | 'ROAD_BLOCKAGE'
  | 'BUILDING_DAMAGE'
  | 'LANDSLIDE'
  | 'MEDICAL_EMERGENCY'
  | 'OTHER';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'REPORTED'
  | 'VERIFIED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: SeverityLevel;
  status: IncidentStatus;
  description: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  address?: string | null;
  photoUrl?: string | null;
  peopleAffected: number;
  rescueRequired: boolean;
  reportedAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    phone?: string;
  };
}

export type RescuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RescueStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface RescueRequest {
  id: string;
  emergencyType: string;
  numberOfPeople: number;
  medicalEmergency: boolean;
  childrenCount: number;
  elderlyCount: number;
  vulnerableCount: number;
  priority: RescuePriority;
  status: RescueStatus;
  description: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  reportedAt: string;
  user?: {
    id: string;
    name: string;
    phone?: string;
  };
  assignedTeam?: RescueTeam | null;
}

export interface RescueTeam {
  id: string;
  name: string;
  leaderName: string;
  contact: string;
  capability: string;
  status: 'AVAILABLE' | 'ON_DUTY' | 'DISPATCHED' | 'OFF_DUTY';
  latitude?: number | null;
  longitude?: number | null;
  lastLocationUpdate?: string | null;
  membersCount: number;
}

export interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  occupancyPercentage: number;
  medicalAvailable: boolean;
  foodAvailable: boolean;
  waterAvailable: boolean;
  contact: string;
  address: string;
  status: string;
  distanceKm?: number;
}

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  emergencyBeds: number;
  icuBeds: number;
  ambulances: number;
  contact: string;
  address: string;
  status: string;
  distanceKm?: number;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL';
  latitude: number;
  longitude: number;
  radiusKm: number;
  active: boolean;
  expiresAt?: string | null;
  createdAt: string;
  distanceFromUserKm?: number;
  isUserInsideHazardZone?: boolean;
}

export interface WeatherData {
  available: boolean;
  provider?: string;
  message?: string;
  latitude?: number;
  longitude?: number;
  temperatureC?: number;
  temperatureF?: number;
  humidity?: number;
  precipitationMm?: number;
  rainfallMm?: number;
  windSpeedKmH?: number;
  condition?: string;
  weatherCode?: number;
  floodRiskIndicator?: string;
  lastUpdated?: string;
}

export interface RiskAnalysisResult {
  riskScore: number;
  riskLevel: SeverityLevel;
  reasoning: string;
  factors: string[];
  nearbyIncidentCount: number;
  measuredRainfallMm: number;
  distinctionNote: string;
  predictionId?: string;
}

export interface DashboardMetrics {
  timestamp: string;
  activeIncidents: number;
  totalIncidents: number;
  criticalIncidents: number;
  activeRescueRequests: number;
  totalRescueRequests: number;
  criticalRescueRequests: number;
  respondersOnline: number;
  respondersAvailable: number;
  totalTeams: number;
  activeAlerts: number;
  shelterCapacity: {
    totalCapacity: number;
    currentOccupancy: number;
    availableCapacity: number;
    occupancyPercentage: number;
  };
  hospitalAvailability: {
    totalEmergencyBeds: number;
    totalIcuBeds: number;
    totalAmbulances: number;
    operationalHospitals: number;
  };
  latestRiskLevel: SeverityLevel;
  latestRiskScore: number;
  recentIncidents: Array<{
    id: string;
    type: IncidentType;
    severity: SeverityLevel;
    description: string;
    reportedAt: string;
    status: IncidentStatus;
  }>;
}

export interface LiveLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  error: string | null;
  isTracking: boolean;
  permissionGranted: boolean;
  address?: string | null;
  isResolvingAddress?: boolean;
}

export interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL' | 'DANGER';
  waterLevelMeters: number;
  dangerLevelMeters: number;
  flowVelocity: string;
  riskScore: number;
  lastUpdated: string;
  streamUrl: string;
}

