"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding ResQGrid disaster management database...');
    // 1. Create Default Users
    const passwordHash = await bcryptjs_1.default.hash('ResQ@2026', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@resqgrid.org' },
        update: {},
        create: {
            name: 'Director Sarah Vance',
            email: 'admin@resqgrid.org',
            password: passwordHash,
            role: client_1.Role.ADMIN,
            phone: '+1-800-555-0199',
        },
    });
    const responder = await prisma.user.upsert({
        where: { email: 'responder@resqgrid.org' },
        update: {},
        create: {
            name: 'Capt. Marcus Reed',
            email: 'responder@resqgrid.org',
            password: passwordHash,
            role: client_1.Role.RESPONDER,
            phone: '+1-800-555-0188',
        },
    });
    const citizen = await prisma.user.upsert({
        where: { email: 'citizen@resqgrid.org' },
        update: {},
        create: {
            name: 'Elena Rostova',
            email: 'citizen@resqgrid.org',
            password: passwordHash,
            role: client_1.Role.CITIZEN,
            phone: '+1-800-555-0177',
        },
    });
    console.log('✅ Created core accounts for Admin, Responder, and Citizen');
    // 2. Create Rescue Teams
    const teams = [
        {
            name: 'Team Alpha - Swift Water',
            leaderName: 'Capt. Marcus Reed',
            contact: '+1-555-0121',
            capability: 'Flood Rescue & Aquatic Extraction',
            status: client_1.ResponderStatus.ON_DUTY,
            latitude: 37.7749,
            longitude: -122.4194,
            lastLocationUpdate: new Date(),
            membersCount: 6,
        },
        {
            name: 'Team Bravo - Trauma Medics',
            leaderName: 'Dr. Chloe Rivera',
            contact: '+1-555-0122',
            capability: 'Emergency Triage & Critical Care',
            status: client_1.ResponderStatus.AVAILABLE,
            latitude: 37.7833,
            longitude: -122.4167,
            lastLocationUpdate: new Date(),
            membersCount: 4,
        },
        {
            name: 'Team Charlie - Urban Search & Rescue',
            leaderName: 'Lt. David Kim',
            contact: '+1-555-0123',
            capability: 'Structural Collapse & Heavy Extrication',
            status: client_1.ResponderStatus.AVAILABLE,
            latitude: 37.7699,
            longitude: -122.4467,
            lastLocationUpdate: new Date(),
            membersCount: 8,
        },
        {
            name: 'Team Delta - Hazmat & Fire',
            leaderName: 'Chief Jack Sullivan',
            contact: '+1-555-0124',
            capability: 'Fire Suppression & Chemical Containment',
            status: client_1.ResponderStatus.AVAILABLE,
            latitude: 37.7558,
            longitude: -122.4188,
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
    console.log('✅ Seeded 4 specialized Rescue Teams');
    // 3. Create Shelters
    const shelters = [
        {
            name: 'Civic Auditorium Disaster Shelter',
            latitude: 37.7783,
            longitude: -122.4168,
            capacity: 350,
            currentOccupancy: 112,
            medicalAvailable: true,
            foodAvailable: true,
            waterAvailable: true,
            contact: '+1-555-8801',
            address: '99 Grove St, Civic Center',
            status: 'ACTIVE',
        },
        {
            name: 'St. Jude Community Relief Hub',
            latitude: 37.7612,
            longitude: -122.4345,
            capacity: 200,
            currentOccupancy: 45,
            medicalAvailable: true,
            foodAvailable: true,
            waterAvailable: true,
            contact: '+1-555-8802',
            address: '422 Castro St',
            status: 'ACTIVE',
        },
        {
            name: 'Marina Middle School Evacuation Center',
            latitude: 37.8015,
            longitude: -122.4372,
            capacity: 500,
            currentOccupancy: 280,
            medicalAvailable: true,
            foodAvailable: true,
            waterAvailable: true,
            contact: '+1-555-8803',
            address: '3500 Fillmore St',
            status: 'ACTIVE',
        },
        {
            name: 'Mission District Sports Complex',
            latitude: 37.7589,
            longitude: -122.4189,
            capacity: 400,
            currentOccupancy: 390,
            medicalAvailable: false,
            foodAvailable: true,
            waterAvailable: true,
            contact: '+1-555-8804',
            address: '750 Harrison Blvd',
            status: 'ACTIVE',
        },
    ];
    for (const shelter of shelters) {
        const existing = await prisma.shelter.findFirst({ where: { name: shelter.name } });
        if (!existing) {
            await prisma.shelter.create({ data: shelter });
        }
    }
    console.log('✅ Seeded 4 Emergency Shelters');
    // 4. Create Hospitals
    const hospitals = [
        {
            name: 'General Trauma & Medical Center',
            latitude: 37.7554,
            longitude: -122.4048,
            emergencyBeds: 45,
            icuBeds: 12,
            ambulances: 8,
            contact: '+1-555-9111',
            address: '1001 Potrero Ave',
            status: 'OPERATIONAL',
        },
        {
            name: 'St. Luke Emergency Care Facility',
            latitude: 37.7478,
            longitude: -122.4211,
            emergencyBeds: 28,
            icuBeds: 6,
            ambulances: 4,
            contact: '+1-555-9112',
            address: '3555 Cesar Chavez St',
            status: 'OPERATIONAL',
        },
        {
            name: 'Presidio Memorial Hospital',
            latitude: 37.7852,
            longitude: -122.4498,
            emergencyBeds: 34,
            icuBeds: 9,
            ambulances: 5,
            contact: '+1-555-9113',
            address: '1600 Divisadero St',
            status: 'OPERATIONAL',
        },
    ];
    for (const hospital of hospitals) {
        const existing = await prisma.hospital.findFirst({ where: { name: hospital.name } });
        if (!existing) {
            await prisma.hospital.create({ data: hospital });
        }
    }
    console.log('✅ Seeded 3 Emergency Hospitals');
    // 5. Create Verified Active Incidents
    const incidents = [
        {
            id: 'INC-20260922-00101',
            type: client_1.IncidentType.FLOOD,
            severity: client_1.Severity.CRITICAL,
            status: client_1.IncidentStatus.VERIFIED,
            description: 'Flash flooding on 14th St subway entrance. Water level rising fast, subway tracks flooded.',
            latitude: 37.7682,
            longitude: -122.4201,
            accuracy: 8.5,
            address: '14th St & Mission St',
            peopleAffected: 24,
            rescueRequired: true,
            userId: citizen.id,
        },
        {
            id: 'INC-20260922-00102',
            type: client_1.IncidentType.ROAD_BLOCKAGE,
            severity: client_1.Severity.HIGH,
            status: client_1.IncidentStatus.VERIFIED,
            description: 'Downed high-voltage power lines and fallen oak tree blocking major evacuation corridor.',
            latitude: 37.7761,
            longitude: -122.4312,
            accuracy: 5.2,
            address: 'Fell St & Webster St',
            peopleAffected: 6,
            rescueRequired: false,
            userId: citizen.id,
        },
        {
            id: 'INC-20260922-00103',
            type: client_1.IncidentType.BUILDING_DAMAGE,
            severity: client_1.Severity.HIGH,
            status: client_1.IncidentStatus.IN_PROGRESS,
            description: 'Partial facade collapse on multi-family residential building. Residents trapped on 2nd floor.',
            latitude: 37.7891,
            longitude: -122.4145,
            accuracy: 12.0,
            address: 'Post St & Taylor St',
            peopleAffected: 11,
            rescueRequired: true,
            userId: citizen.id,
        },
        {
            id: 'INC-20260922-00104',
            type: client_1.IncidentType.FIRE,
            severity: client_1.Severity.CRITICAL,
            status: client_1.IncidentStatus.REPORTED,
            description: 'Transformer explosion triggered secondary structural fire in commercial strip.',
            latitude: 37.7712,
            longitude: -122.4089,
            accuracy: 6.8,
            address: '9th St & Howard St',
            peopleAffected: 18,
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
    console.log('✅ Seeded 4 Active Verified Incidents');
    // 6. Create Active Emergency Alerts
    const alerts = [
        {
            title: 'CRITICAL: Severe Urban Flash Flood Warning',
            message: 'Rapidly rising water levels in low-lying corridors. Avoid underground stations and low-elevation roads. Proceed to designated elevated shelters immediately.',
            severity: client_1.AlertSeverity.CRITICAL,
            latitude: 37.7682,
            longitude: -122.4201,
            radiusKm: 7.5,
            active: true,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        {
            title: 'ADVISORY: Hazardous Road Corridors - Fallen Powerlines',
            message: 'Fell St & Webster St corridor completely shut down due to electrical hazards. Follow tactical detours.',
            severity: client_1.AlertSeverity.WARNING,
            latitude: 37.7761,
            longitude: -122.4312,
            radiusKm: 3.0,
            active: true,
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        },
    ];
    for (const alert of alerts) {
        await prisma.alert.create({ data: alert });
    }
    console.log('✅ Seeded Emergency Geo-fence Alerts');
    console.log('🎉 Database seeding complete!');
}
main()
    .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
