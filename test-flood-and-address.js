// Test script for Flood Tracking, Reverse Geocoding, and Nagpur Map Data

async function runTests() {
  console.log('🧪 Running ResQGrid Flood & Real Address Integration Tests...\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // 1. Test Frontend HTTP Server
  try {
    const res = await fetch('http://localhost:5173/');
    const text = await res.text();
    assert(res.status === 200 && text.includes('ResQGrid'), 'Frontend Vite Server running at port 5173');
  } catch (err) {
    assert(false, `Frontend Vite Server error: ${err.message}`);
  }

  // 2. Test Reverse Geocoding for Nagpur Coordinates
  try {
    const res = await fetch('http://localhost:5000/api/location/reverse-geocode?lat=21.1458&lng=79.0882');
    const data = await res.json();
    assert(
      data.address && data.address.toLowerCase().includes('nagpur'),
      `Nagpur Reverse Geocoding resolves to: "${data.address}"`
    );
  } catch (err) {
    assert(false, `Nagpur reverse geocoding error: ${err.message}`);
  }

  // 3. Test Dynamic Reverse Geocoding (Any Live User Location)
  try {
    // Coordinates for Connaught Place, New Delhi
    const res = await fetch('http://localhost:5000/api/location/reverse-geocode?lat=28.6315&lng=77.2167');
    const data = await res.json();
    assert(
      data.address && (data.address.includes('Delhi') || data.address.includes('India')),
      `Dynamic User Location Geocoding resolves to: "${data.address}"`
    );
  } catch (err) {
    assert(false, `Dynamic reverse geocoding error: ${err.message}`);
  }

  // 4. Test Live CCTV Flood Monitoring Cameras API
  try {
    const res = await fetch('http://localhost:5000/api/location/cctv-cameras');
    const data = await res.json();
    assert(
      data.cameras && data.cameras.length === 4,
      `CCTV Feeds API returns 4 active monitoring stations`
    );

    const ambazari = data.cameras.find(c => c.name.includes('Ambazari'));
    assert(
      ambazari && ambazari.waterLevelMeters > 4.0 && ambazari.status === 'CRITICAL',
      `Ambazari Dam Cam telemetry: ${ambazari?.waterLevelMeters}m (Threshold: ${ambazari?.dangerLevelMeters}m) [${ambazari?.status}]`
    );
  } catch (err) {
    assert(false, `CCTV cameras API error: ${err.message}`);
  }

  // 5. Test Nagpur Incidents, Shelters & Hospitals in Database
  try {
    const [incRes, shRes, hoRes] = await Promise.all([
      fetch('http://localhost:5000/api/incidents').then(r => r.json()),
      fetch('http://localhost:5000/api/shelters').then(r => r.json()),
      fetch('http://localhost:5000/api/hospitals').then(r => r.json()),
    ]);

    const nagpurIncidents = incRes.incidents.filter(i =>
      (i.address && i.address.includes('Nagpur')) || (i.description && i.description.includes('Ambazari'))
    );
    assert(
      nagpurIncidents.length >= 4,
      `Database contains ${nagpurIncidents.length} verified Nagpur flood & disaster incidents`
    );

    const nagpurShelters = shRes.shelters.filter(s => s.address && s.address.includes('Nagpur'));
    assert(
      nagpurShelters.length >= 4,
      `Database contains ${nagpurShelters.length} active Nagpur emergency shelters (Mankapur, Yashwant Stadium, etc.)`
    );

    const nagpurHospitals = hoRes.hospitals.filter(h => h.address && h.address.includes('Nagpur'));
    assert(
      nagpurHospitals.length >= 4,
      `Database contains ${nagpurHospitals.length} operational Nagpur hospitals (AIIMS Nagpur, GMCH, etc.)`
    );
  } catch (err) {
    assert(false, `Nagpur DB query error: ${err.message}`);
  }

  // 6. Test Flood Incident Reporting via Camera Tracker Flow
  try {
    const res = await fetch('http://localhost:5000/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'FLOOD',
        severity: 'CRITICAL',
        description: 'Automated E2E Test: Live flood waterline camera report with GPS.',
        latitude: 21.1458,
        longitude: 79.0882,
        address: 'Sitabuldi Metro Station, Nagpur, Maharashtra, PIN 440012, India',
        peopleAffected: 3,
        rescueRequired: true,
      }),
    });
    const data = await res.json();
    assert(
      res.status === 201 && data.incident && data.incident.address.includes('Sitabuldi'),
      `Flood Incident Reported via Camera HUD attached with real physical address: ${data.incident?.address}`
    );
  } catch (err) {
    assert(false, `Incident creation error: ${err.message}`);
  }

  console.log(`\n🏁 Test Suite Complete: ${passed}/${total} checks PASSED (${Math.round((passed/total)*100)}%)`);
}

runTests();
