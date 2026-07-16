import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import {
  DEFAULT_LOCATION,
  LOCATION_UPDATE_INTERVAL_MS,
  LOCATION_DISTANCE_FILTER_M,
} from '../constants/location';
import type { LatLng } from './locationUtils';

export type { LatLng, LocationResult } from './locationUtils';
export { resolveLocationOrDefault } from './locationUtils';

export type UseCurrentLocationReturn = {
  location: LatLng;
  hasPermission: boolean;
  isLoading: boolean;
  error: Error | null;
};

/** 現在地を継続的に取得するカスタムフック */
export function useCurrentLocation(): UseCurrentLocationReturn {
  const [location, setLocation] = useState<LatLng>({ ...DEFAULT_LOCATION });
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;

        if (!granted) {
          setHasPermission(false);
          setLocation({ ...DEFAULT_LOCATION });
          setIsLoading(false);
          return;
        }

        setHasPermission(true);

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: LOCATION_UPDATE_INTERVAL_MS,
            distanceInterval: LOCATION_DISTANCE_FILTER_M,
          },
          (loc) => {
            if (!cancelled) {
              setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
              setIsLoading(false);
            }
          },
        );

        if (cancelled) {
          subscription.remove();
        } else {
          subscriptionRef.current = subscription;
          setIsLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setLocation({ ...DEFAULT_LOCATION });
          setIsLoading(false);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, []);

  return { location, hasPermission, isLoading, error };
}
