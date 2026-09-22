import React, { useState, useEffect, useCallback } from 'react';
import {
  Navbar,
  ReportIncidentModal,
  RequestRescueModal,
  NearbyHelpModal,
  ResQAssistantModal,
  DamageAnalysisModal,
  EvacuationRoutingModal,
  BroadcastAlertModal,
  FloodTrackerModal,
  WaterwayMonitoringHUD,
  NagpurScenarioHub,
  ResilienceInnovations,
  DisasterTwistsHub,
  AuthModal,
} from './components';
import {
  AuthPage,
  CitizenDashboard,
  ResponderDashboard,
  AdminCommandCenter,
  SheltersHospitalsPage,
} from './pages';
import { useLiveLocation } from './hooks/useLiveLocation';
import { api } from './services/api';
import { socketService } from './services/socket';
import {
  User,
  UserRole,
  Incident,
  RescueRequest,
  Shelter,
  Hospital,
  RescueTeam,
  Alert,
  DashboardMetrics,
  CCTVCamera,
} from './types';

export function App() {
  // Authentication State: starts null so front page begins on Login Page!
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('resqgrid_user');
      const token = localStorage.getItem('resqgrid_token');
      if (stored && token) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Session parse error:', e);
    }
    return null; // Front page starts on Login Page!
  });


  const [activeTab, setActiveTab] = useState<string>('map');

  // Real Browser GPS Telemetry Hook with Reverse Geocoding
  const {
    latitude: userLat,
    longitude: userLng,
    accuracy: userAccuracy,
    timestamp: userTimestamp,
    address: userAddress,
    isResolvingAddress,
    error: locationError,
    isTracking,
    startTracking,
    stopTracking,
  } = useLiveLocation({
    enableHighAccuracy: true,
    autoStart: true,
    broadcastHeartbeat: true,
    role: user?.role,
  });

  // Core Data States
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cctvCameras, setCctvCameras] = useState<CCTVCamera[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<any | null>(null);

  // Modals Visibility
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isFloodModalOpen, setIsFloodModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initial Data Fetching from PostgreSQL
  const fetchData = useCallback(async () => {
    try {
      const [incRes, rescueRes, shelterRes, hospRes, teamRes, alertRes, metricsRes, cctvRes] =
        await Promise.all([
          api.get('/incidents'),
          api.get('/rescue'),
          userLat !== null && userLng !== null
            ? api.get(`/shelters/nearby?lat=${userLat}&lng=${userLng}`)
            : api.get('/shelters'),
          userLat !== null && userLng !== null
            ? api.get(`/hospitals/nearby?lat=${userLat}&lng=${userLng}`)
            : api.get('/hospitals'),
          api.get('/location/responders'),
          userLat !== null && userLng !== null
            ? api.get(`/alerts?lat=${userLat}&lng=${userLng}`)
            : api.get('/alerts'),
          api.get('/dashboard'),
          api.get('/location/cctv-cameras').catch(() => ({ data: { cameras: [] } })),
        ]);

      setIncidents(incRes.data.incidents || []);
      setRescueRequests(rescueRes.data.requests || []);
      setShelters(shelterRes.data.shelters || []);
      setHospitals(hospRes.data.hospitals || []);
      setRescueTeams(teamRes.data.responders || []);
      setAlerts(alertRes.data.alerts || []);
      setMetrics(metricsRes.data);
      if (cctvRes.data?.cameras) {
        setCctvCameras(cctvRes.data.cameras);
      }
    } catch (err: any) {
      console.warn('Initial data load warning:', err.message);
    }
  }, [userLat, userLng]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-Time Socket.IO Subscriptions
  useEffect(() => {
    const socket = socketService.connect();

    if (user?.role) {
      socketService.joinRole(user.role);
    }

    socket.on('incident.created', (newIncident: Incident) => {
      setIncidents((prev) => [newIncident, ...prev]);
      fetchData();
    });

    socket.on('incident.updated', (updatedIncident: Incident) => {
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === updatedIncident.id ? updatedIncident : inc))
      );
      fetchData();
    });

    socket.on('rescue.created', (newRescue: RescueRequest) => {
      setRescueRequests((prev) => [newRescue, ...prev]);
      fetchData();
    });

    socket.on('rescue.assigned', (assignedRescue: RescueRequest) => {
      setRescueRequests((prev) =>
        prev.map((r) => (r.id === assignedRescue.id ? assignedRescue : r))
      );
      fetchData();
    });

    socket.on('rescue.updated', (updatedRescue: RescueRequest) => {
      setRescueRequests((prev) =>
        prev.map((r) => (r.id === updatedRescue.id ? updatedRescue : r))
      );
    });

    socket.on('alert.created', (newAlert: Alert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    socket.on('targeted.alert.warning', (targetedAlert: any) => {
      alert(`⚠️ URGENT CIVIL DEFENSE ALERT: ${targetedAlert.title}\nYou are within the hazard perimeter!`);
    });

    socket.on('responder.location.updated', (data: any) => {
      setRescueTeams((prev) =>
        prev.map((t) => {
          if (t.id === data.responderId || t.name === data.name) {
            return {
              ...t,
              latitude: data.latitude,
              longitude: data.longitude,
              lastLocationUpdate: data.lastUpdated,
            };
          }
          return t;
        })
      );
    });

    return () => {
      socket.off('incident.created');
      socket.off('incident.updated');
      socket.off('rescue.created');
      socket.off('rescue.assigned');
      socket.off('rescue.updated');
      socket.off('alert.created');
      socket.off('targeted.alert.warning');
      socket.off('responder.location.updated');
    };
  }, [user, fetchData]);

  // Auth actions
  const handleAuthSuccess = (authUser: User, token: string) => {
    localStorage.setItem('resqgrid_token', token);
    localStorage.setItem('resqgrid_user', JSON.stringify(authUser));
    setUser(authUser);
    if (authUser.role === 'ADMIN') setActiveTab('admin');
    else if (authUser.role === 'RESPONDER') setActiveTab('responder');
    else setActiveTab('map');
  };

  const handleLogout = () => {
    localStorage.removeItem('resqgrid_token');
    localStorage.removeItem('resqgrid_user');
    setUser(null);
    setActiveTab('map');
  };

  const handleSwitchRole = (role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem('resqgrid_user', JSON.stringify(updated));
      if (role === 'ADMIN') setActiveTab('admin');
      else if (role === 'RESPONDER') setActiveTab('responder');
      else setActiveTab('map');
    }
  };

  const handleNavigateToShelter = (_shelter: Shelter) => {
    setIsRoutingModalOpen(true);
  };

  // If user is not authenticated, show full Auth Page on front!
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">

      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userLat={userLat}
        userLng={userLng}
        userAddress={userAddress}
        isTracking={isTracking}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenRescueModal={() => setIsRescueModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
        onOpenFloodModal={() => setIsFloodModalOpen(true)}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'flood' && (
          <WaterwayMonitoringHUD
            userLat={userLat}
            userLng={userLng}
            userAddress={userAddress}
            onIncidentReported={fetchData}
            onBackToMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'nagpur' && (
          <NagpurScenarioHub
            onOpenWaterwayHUD={() => setActiveTab('flood')}
            onOpenDisasterMap={(_center) => {
              setActiveTab('map');
            }}
            onOpenShelterPage={() => setActiveTab('shelters')}
            onOpenAgencyOps={() => setActiveTab('coordination')}
            onOpenRescueModal={() => setIsRescueModalOpen(true)}
            onOpenDamageModal={() => setIsDamageModalOpen(true)}
            onOpenRoutingModal={() => setIsRoutingModalOpen(true)}
          />
        )}

        {activeTab === 'innovation' && <ResilienceInnovations />}

        {activeTab === 'twists' && (
          <DisasterTwistsHub
            onOpenWaterwayHUD={() => setActiveTab('flood')}
            onOpenDisasterMap={(_center) => setActiveTab('map')}
            onOpenShelterPage={() => setActiveTab('shelters')}
            onOpenAgencyOps={() => setActiveTab('coordination')}
            onBackToMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'map' && (
          <CitizenDashboard
            userLat={userLat}
            userLng={userLng}
            userAccuracy={userAccuracy}
            userTimestamp={userTimestamp}
            userAddress={userAddress}
            isResolvingAddress={isResolvingAddress}
            locationError={locationError}
            isTracking={isTracking}
            onUseCurrentLocation={startTracking}
            onStopTracking={stopTracking}
            incidents={incidents}
            rescueRequests={rescueRequests}
            shelters={shelters}
            hospitals={hospitals}
            rescueTeams={rescueTeams}
            alerts={alerts}
            cctvCameras={cctvCameras}
            routeGeometry={routeGeometry}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenRescueModal={() => setIsRescueModalOpen(true)}
            onOpenNearbyModal={() => setIsNearbyModalOpen(true)}
            onOpenAIModal={() => setIsAIModalOpen(true)}
            onOpenDamageModal={() => setIsDamageModalOpen(true)}
            onOpenRoutingModal={() => setIsRoutingModalOpen(true)}
            onOpenFloodModal={() => setActiveTab('flood')}
          />
        )}

        {activeTab === 'shelters' && (
          <SheltersHospitalsPage
            shelters={shelters}
            hospitals={hospitals}
            userLat={userLat}
            userLng={userLng}
            onNavigateToShelter={handleNavigateToShelter}
          />
        )}

        {activeTab === 'coordination' && (
          <AdminCommandCenter
            metrics={metrics}
            incidents={incidents}
            rescueRequests={rescueRequests}
            shelters={shelters}
            hospitals={hospitals}
            rescueTeams={rescueTeams}
            alerts={alerts}
            userLat={userLat}
            userLng={userLng}
            userAccuracy={userAccuracy}
            onRefreshMetrics={fetchData}
            onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
            onIncidentUpdated={fetchData}
            onRescueUpdated={fetchData}
          />
        )}

        {activeTab === 'responder' && (
          <ResponderDashboard
            user={user}
            userLat={userLat}
            userLng={userLng}
            userAccuracy={userAccuracy}
            userTimestamp={userTimestamp}
            isTracking={isTracking}
            onStartTracking={startTracking}
            onStopTracking={stopTracking}
            incidents={incidents}
            rescueRequests={rescueRequests}
            shelters={shelters}
            hospitals={hospitals}
            rescueTeams={rescueTeams}
          />
        )}
      </main>

      {/* Modals */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userLat={userLat}
        userLng={userLng}
        userAccuracy={userAccuracy}
        userAddress={userAddress}
        onRequestLocation={startTracking}
        onIncidentReported={(newInc) => {
          setIncidents((prev) => [newInc, ...prev]);
          fetchData();
        }}
      />

      <RequestRescueModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
        userLat={userLat}
        userLng={userLng}
        userAccuracy={userAccuracy}
        userAddress={userAddress}
        onRequestLocation={startTracking}
        onRescueSubmitted={(newRescue) => {
          setRescueRequests((prev) => [newRescue, ...prev]);
          fetchData();
        }}
      />

      <FloodTrackerModal
        isOpen={isFloodModalOpen}
        onClose={() => setIsFloodModalOpen(false)}
        userLat={userLat}
        userLng={userLng}
        userAddress={userAddress}
        cctvCameras={cctvCameras}
        onIncidentReported={(newInc) => {
          setIncidents((prev) => [newInc, ...prev]);
          fetchData();
        }}
      />

      <NearbyHelpModal
        isOpen={isNearbyModalOpen}
        onClose={() => setIsNearbyModalOpen(false)}
        userLat={userLat}
        userLng={userLng}
        shelters={shelters}
        hospitals={hospitals}
        rescueTeams={rescueTeams}
        onNavigateToShelter={handleNavigateToShelter}
        onRequestRescue={() => setIsRescueModalOpen(true)}
      />

      <ResQAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        userLat={userLat}
        userLng={userLng}
      />

      <DamageAnalysisModal
        isOpen={isDamageModalOpen}
        onClose={() => setIsDamageModalOpen(false)}
      />

      <EvacuationRoutingModal
        isOpen={isRoutingModalOpen}
        onClose={() => setIsRoutingModalOpen(false)}
        userLat={userLat}
        userLng={userLng}
        shelters={shelters}
        onRouteCalculated={(geom) => {
          setRouteGeometry(geom);
          setActiveTab('map');
        }}
      />

      <BroadcastAlertModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        defaultLat={userLat ?? 21.1458}
        defaultLng={userLng ?? 79.0882}
        onAlertBroadcasted={(newAlert) => {
          setAlerts((prev) => [newAlert, ...prev]);
          fetchData();
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ResQGrid AI – Intelligent Disaster Management &amp; Urban Resilience Platform</span>
          <span className="font-mono text-slate-500">Nagpur Civil Defense &amp; Urban Resilience Operational Sector</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
