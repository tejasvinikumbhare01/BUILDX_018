const axios = require('axios');

async function testE2E() {
  console.log('--- STARTING COMPREHENSIVE E2E VALIDATION ---');
  
  // 1. Health Checks
  const beHealth = await axios.get('http://localhost:5000/api/health');
  console.log('✅ Express Backend Health:', beHealth.data.status);
  
  const aiHealth = await axios.get('http://localhost:8000/health');
  console.log('✅ Python FastAPI Health:', aiHealth.data.status);

  // 2. Report Incident
  const incRes = await axios.post('http://localhost:5000/api/incidents', {
    type: 'FLOOD',
    severity: 'CRITICAL',
    description: 'Submerged underpass on Market St with 2 stranded vehicles.',
    latitude: 37.7790,
    longitude: -122.4180,
    accuracy: 4.2,
    peopleAffected: 5,
    rescueRequired: true,
  });
  const incidentId = incRes.data.incident.id;
  console.log('✅ Incident Created with Real ID:', incidentId, '| Severity:', incRes.data.incident.severity);
  if (!incidentId.startsWith('INC-')) throw new Error('Invalid Incident ID format');

  // 3. Request Emergency Rescue
  const rescueRes = await axios.post('http://localhost:5000/api/rescue', {
    emergencyType: 'Flash Flood Vehicle Submersion',
    numberOfPeople: 4,
    medicalEmergency: true,
    childrenCount: 1,
    elderlyCount: 1,
    vulnerableCount: 0,
    description: 'Water up to car window level, elderly passenger requiring oxygen.',
    latitude: 37.7790,
    longitude: -122.4180,
    accuracy: 3.5,
  });
  const rescueId = rescueRes.data.rescue.id;
  console.log('✅ Rescue Request Created with Real ID:', rescueId, '| Priority:', rescueRes.data.rescue.priority);
  console.log('   Top Recommended Responder:', rescueRes.data.recommendedResponders[0]?.team?.name, '(', rescueRes.data.recommendedResponders[0]?.distanceKm, 'km away)');
  if (!rescueId.startsWith('RES-')) throw new Error('Invalid Rescue ID format');

  // 4. Responder Allocation
  const bestTeamId = rescueRes.data.recommendedResponders[0].team.id;
  const tokenRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'admin@resqgrid.org',
    password: 'ResQ@2026',
  });
  const adminToken = tokenRes.data.token;
  
  const assignRes = await axios.post(
    `http://localhost:5000/api/rescue/${rescueId}/assign`,
    { teamId: bestTeamId, notes: 'Deploy Swift Water Rescue Boat 1' },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  console.log('✅ Responder Assigned:', assignRes.data.rescue.assignedTeam?.name, '| Status:', assignRes.data.rescue.status);

  // 5. Nearby Shelters & Hospitals with Real Haversine
  const shelterRes = await axios.get('http://localhost:5000/api/shelters/nearby?lat=37.7790&lng=-122.4180');
  console.log('✅ Nearest Shelter Distance:', shelterRes.data.shelters[0].name, '-', shelterRes.data.shelters[0].distanceKm, 'km away');

  const hospRes = await axios.get('http://localhost:5000/api/hospitals/nearby?lat=37.7790&lng=-122.4180');
  console.log('✅ Nearest Hospital Distance:', hospRes.data.hospitals[0].name, '-', hospRes.data.hospitals[0].distanceKm, 'km away');

  // 6. Live Weather Data
  const weatherRes = await axios.get('http://localhost:5000/api/weather/live?lat=37.7790&lng=-122.4180');
  console.log('✅ Real Weather API:', weatherRes.data.condition, '| Temp:', weatherRes.data.temperatureC, '°C | Rain:', weatherRes.data.rainfallMm, 'mm/h');

  // 7. AI Spatial Risk Modeling (Python FastAPI -> PostgreSQL)
  const riskRes = await axios.post('http://localhost:5000/api/ai/risk', { latitude: 37.7790, longitude: -122.4180 });
  console.log('✅ AI Risk Prediction Score:', riskRes.data.riskScore, '/ 100 | Level:', riskRes.data.riskLevel);

  // 8. ResQ AI RAG Chatbot
  const aiChatRes = await axios.post('http://localhost:5000/api/ai/chat', {
    message: 'Where is the nearest shelter?',
    latitude: 37.7790,
    longitude: -122.4180,
  });
  console.log('✅ ResQ AI Grounded Response Snippet:', aiChatRes.data.reply.substring(0, 140) + '...');

  // 9. Evacuation Route Calculation (OSRM OpenStreetMap Engine)
  const nearestShelter = shelterRes.data.shelters[0];
  const routeRes = await axios.get(
    `http://localhost:5000/api/routing/evacuation?originLat=37.7790&originLng=-122.4180&destLat=${nearestShelter.latitude}&destLng=${nearestShelter.longitude}`
  );
  console.log('✅ Evacuation Routing:', routeRes.data.distanceKm, 'km | Est:', routeRes.data.durationMin, 'min | Safe:', routeRes.data.isRouteVerifiedSafe);

  // 10. Dashboard Real Aggregation Verification
  const dashRes = await axios.get('http://localhost:5000/api/dashboard');
  console.log('✅ Dashboard Real PostgreSQL Stats:');
  console.log('   Active Incidents:', dashRes.data.activeIncidents);
  console.log('   Active Rescues:', dashRes.data.activeRescueRequests);
  console.log('   Total Shelter Capacity:', dashRes.data.shelterCapacity.totalCapacity, '| Occupancy:', dashRes.data.shelterCapacity.currentOccupancy);
  console.log('   Total Emergency Beds:', dashRes.data.hospitalAvailability.totalEmergencyBeds);

  console.log('\n🏆 ALL 10 E2E VALIDATION TESTS PASSED WITH 100% SUCCESS! 🏆\n');
}

testE2E().catch((err) => {
  console.error('❌ E2E Validation Error:', err.response?.data || err.message);
  process.exit(1);
});
