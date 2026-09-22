import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveLocationState } from '../types';
import { socketService } from '../services/socket';
import { api } from '../services/api';

export function useLiveLocation(options?: {
  enableHighAccuracy?: boolean;
  autoStart?: boolean;
  broadcastHeartbeat?: boolean;
  role?: string;
}) {
  const [locationState, setLocationState] = useState<LiveLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    error: null,
    isTracking: false,
    permissionGranted: false,
    address: null,
    isResolvingAddress: false,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastGeocodedRef = useRef<{ lat: number; lng: number } | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    // Avoid spamming if coordinates changed by less than ~20 meters (~0.0002 deg)
    if (
      lastGeocodedRef.current &&
      Math.abs(lastGeocodedRef.current.lat - lat) < 0.0002 &&
      Math.abs(lastGeocodedRef.current.lng - lng) < 0.0002
    ) {
      return;
    }

    lastGeocodedRef.current = { lat, lng };
    setLocationState((prev) => ({ ...prev, isResolvingAddress: true }));

    try {
      const res = await api.get('/location/reverse-geocode', {
        params: { lat, lng },
      });
      if (res.data?.address) {
        setLocationState((prev) => ({
          ...prev,
          address: res.data.address,
          isResolvingAddress: false,
        }));
      } else {
        setLocationState((prev) => ({ ...prev, isResolvingAddress: false }));
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      setLocationState((prev) => ({ ...prev, isResolvingAddress: false }));
    }
  }, []);

  const handlePositionSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    const timestamp = position.timestamp;

    setLocationState((prev) => ({
      ...prev,
      latitude,
      longitude,
      accuracy: Math.round(accuracy * 10) / 10,
      timestamp,
      error: null,
      isTracking: true,
      permissionGranted: true,
    }));

    // Trigger reverse geocode for real street address
    reverseGeocode(latitude, longitude);

    if (options?.broadcastHeartbeat) {
      socketService.sendLocationHeartbeat(latitude, longitude, options.role);
    }
  }, [options?.broadcastHeartbeat, options?.role, reverseGeocode]);


  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    let errorMsg = 'An unknown geolocation error occurred.';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMsg = 'Location permission denied by user. Please enable location permissions in browser.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMsg = 'Physical location information is currently unavailable from GPS hardware.';
        break;
      case error.TIMEOUT:
        errorMsg = 'Location request timed out while contacting GPS satellites.';
        break;
    }

    setLocationState((prev) => ({
      ...prev,
      error: errorMsg,
      isTracking: false,
      permissionGranted: false,
    }));
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState((prev) => ({
        ...prev,
        error: 'Browser Geolocation API is not supported by your browser.',
        isTracking: false,
      }));
      return;
    }

    // Stop any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Immediate one-off fix
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Continuous watchPosition for live tracking as user moves
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );

    setLocationState((prev) => ({ ...prev, isTracking: true }));
  }, [handlePositionSuccess, handlePositionError, options?.enableHighAccuracy]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocationState((prev) => ({ ...prev, isTracking: false }));
  }, []);

  // Optional auto-start
  useEffect(() => {
    if (options?.autoStart) {
      startTracking();
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [options?.autoStart, startTracking]);

  return {
    ...locationState,
    startTracking,
    stopTracking,
  };
}
