import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const Role = {
  CITIZEN: 'CITIZEN',
  RESPONDER: 'RESPONDER',
  ADMIN: 'ADMIN',
} as const;

const IncidentType = {
  FLOOD: 'FLOOD',
  FIRE: 'FIRE',
  ROAD_BLOCKAGE: 'ROAD_BLOCKAGE',
  BUILDING_DAMAGE: 'BUILDING_DAMAGE',
  LANDSLIDE: 'LANDSLIDE',
  MEDICAL_EMERGENCY: 'MEDICAL_EMERGENCY',
  OTHER: 'OTHER',
} as const;

const Severity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

const IncidentStatus = {
  REPORTED: 'REPORTED',
  VERIFIED: 'VERIFIED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const;

const AlertSeverity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  DANGER: 'DANGER',
  CRITICAL: 'CRITICAL',
} as const;

const ResponderStatus = {
  AVAILABLE: 'AVAILABLE',
  ON_DUTY: 'ON_DUTY',
  DISPATCHED: 'DISPATCHED',
  OFF_DUTY: 'OFF_DUTY',
} as const;

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ResQGrid disaster management database with Nagpur regional infrastructure...');

  // 1. Create Default Users
  const passwordHash = await bcrypt.hash('ResQ@2026', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@resqgrid.org' },
    update: {},
    create: {
      name: 'Director Sarah Vance',
      email: 'admin@resqgrid.org',
      password: passwordHash,
      role: Role.ADMIN,
      phone: '+91-712-256-0199',
    },
  });

  const responder = await prisma.user.upsert({
    where: { email: 'responder@resqgrid.org' },
    update: {},
    create: {
      name: 'Capt. Marcus Reed',
      email: 'responder@resqgrid.org',
      password: passwordHash,
      role: Role.RESPONDER,
      phone: '+91-712-256-0188',
    },
  });

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@resqgrid.org' },
    update: {},
    create: {
      name: 'Elena Rostova',
      email: 'citizen@resqgrid.org',
      password: passwordHash,
      role: Role.CITIZEN,
      phone: '+91-712-256-0177',
    },
  });

  console.log('✅ Created core accounts for Admin, Responder, and Citizen');

  // 2. Create Rescue Teams in Nagpur (Inter-Agency Coordination: SDRF, NMC, Police, Fire)
  const teams = [
    {
      name: 'SDRF Nagpur 1st Battalion - Swift Water Team',
      leaderName: 'Capt. Marcus Reed',
      contact: '+91-712-256-1101',
      capability: 'Flood Rescue & Aquatic Extraction',
      status: ResponderStatus.ON_DUTY,
      latitude: 21.1460,
      longitude: 79.0860,
      lastLocationUpdate: new Date(),
      membersCount: 8,
    },
    {
      name: 'Nagpur Fire & Emergency Services - Itwari Station',
      leaderName: 'Chief Officer Arvind Deshmukh',
      contact: '+91-712-256-1105',
      capability: 'Market Fire Suppression & Hydrant Pressurization',
      status: ResponderStatus.ON_DUTY,
      latitude: 21.1560,
      longitude: 79.1125,
      lastLocationUpdate: new Date(),
      membersCount: 14,
    },
    {
      name: 'NMC Disaster Quick Response Team',
      leaderName: 'Insp. Rajesh Sharma',
      contact: '+91-712-256-1102',
      capability: 'Urban Inundation & Pumping Operations',
      status: ResponderStatus.AVAILABLE,
      latitude: 21.1539,
      longitude: 79.0700,
      lastLocationUpdate: new Date(),
      membersCount: 6,
    },
    {
      name: 'Nagpur City Police - Traffic & Blockage Control',
      leaderName: 'DCP Vinod Patil',
      contact: '+91-712-256-1106',
      capability: 'Underpass Roadblocks & Detour Enforcement',
      status: ResponderStatus.ON_DUTY,
      latitude: 21.1092,
      longitude: 79.0784,
      lastLocationUpdate: new Date(),
      membersCount: 10,
    },
    {
      name: 'NDRF Unit 10 - Western Sector Rescue',
      leaderName: 'Lt. David Kim',
      contact: '+91-712-256-1103',
      capability: 'Heavy Extraction & High-Risk Evacuation',
      status: ResponderStatus.AVAILABLE,
      latitude: 21.1320,
      longitude: 79.0420,
      lastLocationUpdate: new Date(),
      membersCount: 12,
    },
    {
      name: 'Nagpur Trauma & Medical Quick Corps',
      leaderName: 'Dr. Chloe Rivera',
      contact: '+91-712-256-1104',
      capability: 'Emergency Triage & Critical Care Ambulances',
      status: ResponderStatus.AVAILABLE,
      latitude: 21.1294,
      longitude: 79.0988,
      lastLocationUpdate: new Date(),
      membersCount: 5,
    },
  ];

  for (const team of teams) {
    await prisma.rescueTeam.upsert({
      where: { name: team.name },
      update: team,
      create: team,
    });
  }
  console.log('✅ Seeded 6 Inter-Agency Rescue Teams in Nagpur');

  // 3. Create Shelters in Nagpur (Including Capacity Balancing: One Over Capacity, One Empty)
  const shelters = [
    {
      name: 'Somany High School Relief Center (Over Capacity)',
      latitude: 21.1410,
      longitude: 79.0815,
      capacity: 400,
      currentOccupancy: 425, // 106% - Over Capacity
      medicalAvailable: true,
      foodAvailable: false,
      waterAvailable: true,
      contact: '+91-712-259-8810',
      address: 'Near Sitabuldi Main Road, Nagpur 440012',
      status: 'OVER_CAPACITY',
    },
    {
      name: 'Dharampeth Community Hall (Available Relief Hub)',
      latitude: 21.1442,
      longitude: 79.0665,
      capacity: 650,
      currentOccupancy: 85, // 13% - Nearly Empty
      medicalAvailable: true,
      foodAvailable: true,
      waterAvailable: true,
      contact: '+91-712-259-8811',
      address: 'West High Court Road, Dharampeth, Nagpur 440010',
      status: 'ACTIVE',
    },
    {
      name: 'Mankapur Indoor Sports Complex Disaster Shelter',
      latitude: 21.1925,
      longitude: 79.0812,
      capacity: 1200,
      currentOccupancy: 340,
      medicalAvailable: true,
      foodAvailable: true,
      waterAvailable: true,
      contact: '+91-712-259-8801',
      address: 'Koradi Rd, Mankapur, Nagpur, Maharashtra 440030',
      status: 'ACTIVE',
    },
    {
      name: 'Yashwant Stadium Emergency Relief Hub',
      latitude: 21.1384,
      longitude: 79.0833,
      capacity: 800,
      currentOccupancy: 180,
      medicalAvailable: true,
      foodAvailable: true,
      waterAvailable: true,
      contact: '+91-712-259-8802',
      address: 'Dhantoli, Wardha Road, Nagpur, Maharashtra 440012',
      status: 'ACTIVE',
    },
    {
      name: 'VNIT Campus Evacuation & Relief Center',
      latitude: 21.1260,
      longitude: 79.0514,
      capacity: 600,
      currentOccupancy: 95,
      medicalAvailable: true,
      foodAvailable: true,
      waterAvailable: true,
      contact: '+91-712-259-8803',
      address: 'South Ambazari Rd, Bajaj Nagar, Nagpur, Maharashtra 440010',
      status: 'ACTIVE',
    },
    {
      name: 'Reshimbagh Flood Relief Shelter',
      latitude: 21.1278,
      longitude: 79.1081,
      capacity: 500,
      currentOccupancy: 210,
      medicalAvailable: false,
      foodAvailable: true,
      waterAvailable: true,
      contact: '+91-712-259-8804',
      address: 'Reshimbagh Ground, Great Nag Road, Nagpur, Maharashtra 440009',
      status: 'ACTIVE',
    },
  ];

  for (const shelter of shelters) {
    const existing = await prisma.shelter.findFirst({ where: { name: shelter.name } });
    if (!existing) {
      await prisma.shelter.create({ data: shelter });
    } else {
      await prisma.shelter.update({ where: { id: existing.id }, data: shelter });
    }
  }
  console.log('✅ Seeded 6 Emergency Shelters with Live Capacity Balancing in Nagpur');

  // 4. Create Hospitals in Nagpur
  const hospitals = [
    {
      name: 'AIIMS Nagpur (Apex Trauma Center)',
      latitude: 21.0387,
      longitude: 79.0275,
      emergencyBeds: 60,
      icuBeds: 24,
      ambulances: 12,
      contact: '+91-712-282-5000',
      address: 'Plot No. 2, Sector 20, MIHAN, Nagpur, Maharashtra 441108',
      status: 'OPERATIONAL',
    },
    {
      name: 'Government Medical College & Hospital (GMCH)',
      latitude: 21.1294,
      longitude: 79.0988,
      emergencyBeds: 90,
      icuBeds: 30,
      ambulances: 15,
      contact: '+91-712-274-4400',
      address: 'Medical Square, Hanuman Nagar, Nagpur, Maharashtra 440009',
      status: 'OPERATIONAL',
    },
    {
      name: 'Kingsway Hospitals (Emergency Center)',
      latitude: 21.1557,
      longitude: 79.0863,
      emergencyBeds: 40,
      icuBeds: 16,
      ambulances: 8,
      contact: '+91-712-669-0000',
      address: 'Near Kasturchand Park, Mohan Nagar, Nagpur, Maharashtra 440001',
      status: 'OPERATIONAL',
    },
    {
      name: 'Orange City Hospital & Research Institute',
      latitude: 21.1158,
      longitude: 79.0621,
      emergencyBeds: 35,
      icuBeds: 12,
      ambulances: 6,
      contact: '+91-712-223-8431',
      address: 'Plot 19, Khamla Square, Ring Rd, Nagpur, Maharashtra 440015',
      status: 'OPERATIONAL',
    },
  ];

  for (const hospital of hospitals) {
    const existing = await prisma.hospital.findFirst({ where: { name: hospital.name } });
    if (!existing) {
      await prisma.hospital.create({ data: hospital });
    } else {
      await prisma.hospital.update({ where: { id: existing.id }, data: hospital });
    }
  }
  console.log('✅ Seeded 4 Emergency Hospitals in Nagpur');

  // 5. Create Verified Active Incidents in Nagpur
  const incidents = [
    {
      id: 'INC-NGP-2026-001',
      type: IncidentType.FLOOD,
      severity: Severity.CRITICAL,
      status: IncidentStatus.VERIFIED,
      description: 'Ambazari lake overflow canal breaching banks. Corporation Colony and Shankar Nagar low-lying residential sectors inundated under 4 ft rushing water.',
      latitude: 21.1345,
      longitude: 79.0478,
      accuracy: 6.5,
      address: 'Ambazari Dam Spillway, Corporation Colony, Nagpur',
      peopleAffected: 45,
      rescueRequired: true,
      userId: citizen.id,
    },
    {
      id: 'INC-NGP-2026-002',
      type: IncidentType.FLOOD,
      severity: Severity.CRITICAL,
      status: IncidentStatus.VERIFIED,
      description: 'Nag River Sitabuldi bridge channel overflow. Rapidly rising current spilling onto connecting underpasses and commercial basements.',
      latitude: 21.1448,
      longitude: 79.0847,
      accuracy: 4.8,
      address: 'Nag River Sitabuldi Bridge, Near Maharajbagh, Nagpur',
      peopleAffected: 32,
      rescueRequired: true,
      userId: citizen.id,
    },
    {
      id: 'INC-NGP-2026-003',
      type: IncidentType.ROAD_BLOCKAGE,
      severity: Severity.HIGH,
      status: IncidentStatus.IN_PROGRESS,
      description: 'Narendra Nagar Railway Underpass completely submerged under 5 ft water. Several passenger cars stuck, ring road traffic halted.',
      latitude: 21.1092,
      longitude: 79.0784,
      accuracy: 5.2,
      address: 'Narendra Nagar Subway, Outer Ring Road, Nagpur',
      peopleAffected: 14,
      rescueRequired: false,
      userId: citizen.id,
    },
    {
      id: 'INC-NGP-2026-004',
      type: IncidentType.FLOOD,
      severity: Severity.HIGH,
      status: IncidentStatus.REPORTED,
      description: 'Pili River flash swell. Inundation reported across Kamptee Road, Jaripatka low-income housing clusters.',
      latitude: 21.1985,
      longitude: 79.1120,
      accuracy: 8.0,
      address: 'Pili River Bridge, Kamptee Road, Jaripatka, Nagpur',
      peopleAffected: 28,
      rescueRequired: true,
      userId: citizen.id,
    },
    {
      id: 'INC-NGP-2026-005',
      type: IncidentType.FIRE,
      severity: Severity.CRITICAL,
      status: IncidentStatus.IN_PROGRESS,
      description: 'Major commercial fabric warehouse fire in Itwari Wholesale Market. Dense narrow lanes. ResQGrid Fire Hydrant GIS active: 3 nearby hydrants pressurized; municipal lane cleared.',
      latitude: 21.1568,
      longitude: 79.1132,
      accuracy: 3.5,
      address: 'Itwari Cloth Market, Sarafa Bazaar, Nagpur 440002',
      peopleAffected: 65,
      rescueRequired: true,
      userId: citizen.id,
    },
    {
      id: 'INC-NGP-2026-006',
      type: IncidentType.FLOOD,
      severity: Severity.HIGH,
      status: IncidentStatus.VERIFIED,
      description: 'Severe storm drain surge and backflow into Sakkardara residential enclave. 85 ground-floor homes inundated under 3.5 ft water.',
      latitude: 21.1215,
      longitude: 79.1180,
      accuracy: 6.0,
      address: 'Sakkardara Lake Enclave, Near Ayurvedic College, Nagpur',
      peopleAffected: 85,
      rescueRequired: true,
      userId: citizen.id,
    },
    {
      id: 'INC-NGP-2026-007',
      type: IncidentType.FLOOD,
      severity: Severity.CRITICAL,
      status: IncidentStatus.IN_PROGRESS,
      description: 'Cloudburst flash surge along Nag River tributaries breaching banks into Pratap Nagar & Sonegaon low-lying colonies. SDRF swift water boat actively extracting trapped residents.',
      latitude: 21.1120,
      longitude: 79.0550,
      accuracy: 4.0,
      address: 'Pratap Nagar & Sonegaon Canal Crossing, Nagpur',
      peopleAffected: 120,
      rescueRequired: true,
      userId: citizen.id,
    },
  ];

  for (const incident of incidents) {
    await prisma.incident.upsert({
      where: { id: incident.id },
      update: incident,
      create: incident,
    });
  }
  console.log('✅ Seeded 7 Active Verified Nagpur Incidents (including Itwari Fire, Sakkardara, Pratap Nagar, Sonegaon)');

  // 6. Create Priority Rescue Request for Family stuck in Narendra Nagar Underpass
  const sdrfTeam = await prisma.rescueTeam.findFirst({ where: { name: { contains: 'SDRF' } } });
  
  await prisma.rescueRequest.upsert({
    where: { id: 'REQ-NGP-2026-001' },
    update: {},
    create: {
      id: 'REQ-NGP-2026-001',
      emergencyType: 'FLOOD_EXTRACTION',
      numberOfPeople: 4,
      medicalEmergency: true,
      childrenCount: 2,
      elderlyCount: 1,
      vulnerableCount: 3,
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      description: 'URGENT: Family SUV trapped in Narendra Nagar flooded railway underpass under 5 ft rapidly rising water. 2 young children and 1 elderly passenger. Cell reception intermittent.',
      latitude: 21.1092,
      longitude: 79.0784,
      accuracy: 3.5,
      userId: citizen.id,
      assignedTeamId: sdrfTeam?.id,
    },
  });
  console.log('✅ Seeded Critical Underpass Family Rescue Request (Assigned to SDRF Team)');

  // 7. Create Active Emergency Alerts in Nagpur
  const alerts = [
    {
      title: 'CRITICAL: Nag River Cloudburst & Flash Flooding (Sakkardara, Pratap Nagar, Sonegaon)',
      message: 'Nag River overflow breaching residential banks. Low-lying colonies in Sakkardara, Pratap Nagar, and Sonegaon experiencing acute inundation. Somany High School is at maximum capacity; evacuees are being redirected to Dharampeth Community Hall.',
      severity: AlertSeverity.CRITICAL,
      latitude: 21.1345,
      longitude: 79.0478,
      radiusKm: 10.0,
      active: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      title: 'TRAFFIC ALERT: Narendra Nagar Railway Underpass Completely Blocked',
      message: 'Underpass submerged under 5.5 ft water. Road closed in both directions. Police detour active via Wardha Road Elevated Corridor.',
      severity: AlertSeverity.WARNING,
      latitude: 21.1092,
      longitude: 79.0784,
      radiusKm: 4.5,
      active: true,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
    {
      title: 'FIRE EMERGENCY: Itwari Cloth Market Hydrant & Clearance Zone',
      message: 'Fire tender access corridor established on Sarafa Bazaar Main Road. Citizens keep Itwari Market feeder lanes clear for pressurized water tankers.',
      severity: AlertSeverity.WARNING,
      latitude: 21.1568,
      longitude: 79.1132,
      radiusKm: 2.0,
      active: true,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
  ];

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert });
  }
  console.log('✅ Seeded Emergency Geo-fence Alerts in Nagpur');

  console.log('🎉 Nagpur database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
