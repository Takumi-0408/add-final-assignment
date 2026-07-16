import { memo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouteStore } from '../src/stores/routeStore';
import { formatDistance, formatDuration } from '../src/utils/format';
import { decodePolyline } from '../src/utils/polyline';
import { COLORS } from '../src/constants/colors';
import { DEFAULT_MAP_DELTA } from '../src/constants/location';
import type { WalkRoute } from '../src/types/routes';

// ─── ポリラインを memo 化してルート選択のたびに全再描画しないように ──────────

type RoutePolylinesProps = {
  routes: WalkRoute[];
  selectedRouteId: string | undefined;
};

const RoutePolylines = memo(function RoutePolylines({
  routes,
  selectedRouteId,
}: RoutePolylinesProps) {
  return (
    <>
      {routes.map((route) => {
        const coords = decodePolyline(route.polyline).map((c) => ({
          latitude: c.latitude,
          longitude: c.longitude,
        }));
        const isSelected = route.routeId === selectedRouteId;
        return (
          <Polyline
            key={route.routeId}
            coordinates={coords}
            strokeColor={isSelected ? COLORS.primary : '#9CA3AF'}
            strokeWidth={isSelected ? 4 : 2}
          />
        );
      })}
    </>
  );
});

// S-08: ルート提案画面
export default function RouteSuggestionsScreen() {
  const router = useRouter();
  const { routes, selectedRoute, selectRoute, destination, isSearching, searchError } =
    useRouteStore();

  const handleSelect = useCallback(
    (route: WalkRoute) => {
      selectRoute(route);
    },
    [selectRoute],
  );

  const handleStartNav = useCallback(() => {
    if (!selectedRoute) return;
    router.push('/navigation');
  }, [selectedRoute, router]);

  const displayRoute = selectedRoute ?? routes[0] ?? null;
  const mapCenter = destination?.location ?? { latitude: 35.6812, longitude: 139.7671 };

  // ルート検索中ローディング
  if (isSearching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>ルートを検索中...</Text>
      </View>
    );
  }

  // 検索エラー
  if (searchError && routes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{searchError.message}</Text>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.backLink}>条件を変更する</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 地図 */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{ ...mapCenter, ...DEFAULT_MAP_DELTA }}
        showsCompass={false}
        toolbarEnabled={false}
      >
        <RoutePolylines routes={routes} selectedRouteId={displayRoute?.routeId} />
      </MapView>

      {/* ルートカード一覧 */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>ルート候補</Text>
        <FlatList
          data={routes}
          keyExtractor={(r) => r.routeId}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardList}
          renderItem={({ item: route, index }) => {
            const isSelected = route.routeId === (selectedRoute?.routeId ?? routes[0]?.routeId);
            return (
              <TouchableOpacity
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleSelect(route)}
                accessibilityRole="button"
                accessibilityLabel={`ルート${index + 1} 散歩スコア${route.walkScore}`}
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>散歩スコア</Text>
                  <Text style={[styles.scoreValue, { color: scoreColor(route.walkScore) }]}>
                    {route.walkScore}
                  </Text>
                </View>
                <Text style={styles.routeInfo}>
                  {formatDistance(route.distanceMeters)} · {formatDuration(route.durationSeconds)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* ナビ開始ボタン */}
        <TouchableOpacity
          style={[styles.startButton, !displayRoute && styles.disabled]}
          onPress={handleStartNav}
          disabled={!displayRoute}
          accessibilityRole="button"
          accessibilityLabel="このルートでナビを開始"
        >
          <Text style={styles.startButtonText}>このルートでナビを開始</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function scoreColor(score: number): string {
  if (score >= 75) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    gap: 16,
  },
  loadingText: { fontSize: 15, color: COLORS.textSecondary },
  errorText: { fontSize: 15, color: COLORS.error, textAlign: 'center', paddingHorizontal: 24 },
  backLink: { fontSize: 14, color: COLORS.primary, textDecorationLine: 'underline' },
  map: { flex: 1 },
  panel: {
    backgroundColor: COLORS.surface,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  cardList: { paddingHorizontal: 16, gap: 10 },
  card: {
    width: 160,
    padding: 14,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cardSelected: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreLabel: { fontSize: 11, color: COLORS.textSecondary },
  scoreValue: { fontSize: 26, fontWeight: '800' },
  routeInfo: { fontSize: 12, color: COLORS.textSecondary },
  startButton: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  startButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
});
