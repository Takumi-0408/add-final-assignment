import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useCurrentLocation } from '../src/hooks/useCurrentLocation';
import { useRouteStore } from '../src/stores/routeStore';
import { useNavigationStore } from '../src/stores/navigationStore';
import { formatDistance, formatDuration } from '../src/utils/format';
import { decodePolyline } from '../src/utils/polyline';
import { COLORS } from '../src/constants/colors';

// S-09: ナビゲーション画面
export default function NavigationScreen() {
  const router = useRouter();
  const { location } = useCurrentLocation();
  const { selectedRoute, searchRoutes } = useRouteStore();
  const {
    isNavigating,
    currentRoute,
    currentStepIndex,
    isDeviated,
    isRerouting,
    elapsedSeconds,
    startNavigation,
    stopNavigation,
    updateLocation,
    setRerouting,
    tick,
  } = useNavigationStore();

  const mapRef = useRef<MapView>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rerouteAttempts = useRef(0);
  const MAX_REROUTE = 2;

  // ナビ開始
  useEffect(() => {
    if (selectedRoute && !isNavigating) {
      startNavigation(selectedRoute, location);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1秒タイマー
  useEffect(() => {
    tickRef.current = setInterval(tick, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [tick]);

  // 位置更新 & 逸脱検知
  useEffect(() => {
    if (!isNavigating) return;
    updateLocation(location);
  }, [location, isNavigating, updateLocation]);

  // 逸脱時の自動リルート（指数バックオフ、最大2回）
  useEffect(() => {
    if (!isDeviated || isRerouting || !currentRoute) return;
    if (rerouteAttempts.current >= MAX_REROUTE) return;

    const attempt = rerouteAttempts.current;
    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s

    const timer = setTimeout(async () => {
      setRerouting(true);
      rerouteAttempts.current += 1;
      try {
        await searchRoutes(location);
        const newRoute = useRouteStore.getState().routes[0];
        if (newRoute) {
          startNavigation(newRoute, location);
          rerouteAttempts.current = 0;
        }
      } finally {
        setRerouting(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [
    isDeviated,
    isRerouting,
    currentRoute,
    location,
    searchRoutes,
    setRerouting,
    startNavigation,
  ]);

  const handleStop = () => {
    Alert.alert('ナビゲーション終了', 'ナビゲーションを終了しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '終了',
        style: 'destructive',
        onPress: () => {
          stopNavigation();
          router.replace('/summary');
        },
      },
    ]);
  };

  const route = currentRoute ?? selectedRoute;
  if (!route) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>ルートが選択されていません</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const routeCoords = decodePolyline(route.polyline).map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  const currentStep = route.steps[currentStepIndex];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        followsUserLocation
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Polyline coordinates={routeCoords} strokeColor={COLORS.primary} strokeWidth={4} />
      </MapView>

      {/* リルート中オーバーレイ */}
      {isRerouting && (
        <View style={styles.rerouteOverlay}>
          <Text style={styles.rerouteText}>ルートを再検索中...</Text>
        </View>
      )}

      {/* 案内パネル */}
      <View style={styles.panel}>
        {currentStep ? (
          <>
            <Text style={styles.instruction}>{currentStep.instruction}</Text>
            <Text style={styles.stepDistance}>{formatDistance(currentStep.distanceMeters)}先</Text>
          </>
        ) : (
          <Text style={styles.instruction}>目的地へ向かっています</Text>
        )}

        <View style={styles.statsRow}>
          <Text style={styles.stat}>経過: {formatDuration(elapsedSeconds)}</Text>
          <Text style={styles.stat}>残り: {formatDistance(route.distanceMeters)}</Text>
        </View>

        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleStop}
          accessibilityRole="button"
          accessibilityLabel="ナビゲーションを終了"
        >
          <Text style={styles.stopButtonText}>終了</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: COLORS.textSecondary, marginBottom: 16 },
  linkText: { color: COLORS.primary },
  rerouteOverlay: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: COLORS.warning,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  rerouteText: { color: COLORS.surface, fontWeight: '600' },
  panel: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  instruction: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  stepDistance: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  stat: { fontSize: 14, color: COLORS.textSecondary },
  stopButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  stopButtonText: { color: COLORS.error, fontSize: 15, fontWeight: '600' },
});
