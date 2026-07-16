import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuthStore } from '../../src/stores/authStore';
import { useFavoritesStore } from '../../src/stores/favoritesStore';
import { useRouteStore } from '../../src/stores/routeStore';
import { useNavigationStore } from '../../src/stores/navigationStore';
import { decodePolyline } from '../../src/utils/polyline';
import { formatDistance, formatDuration } from '../../src/utils/format';
import { COLORS } from '../../src/constants/colors';
import { DEFAULT_MAP_DELTA } from '../../src/constants/location';
import type { Favorite } from '../../src/types/favorites';

// S-12: お気に入り詳細画面
export default function FavoriteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { favorites, fetchFavorites } = useFavoritesStore();
  const { selectRoute } = useRouteStore();
  const { startNavigation } = useNavigationStore();

  const [fav, setFav] = useState<Favorite | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    // キャッシュから探す
    const found = favorites.find((f) => f.favoriteId === id);
    if (found) {
      setFav(found);
    } else {
      // キャッシュにない場合は再取得
      fetchFavorites(user.uid).then(() => {
        const refound = useFavoritesStore.getState().favorites.find((f) => f.favoriteId === id);
        setFav(refound ?? null);
      });
    }
    // favorites・fetchFavorites・router は安定参照のため deps から除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleStartNav = () => {
    if (!fav) return;
    // お気に入りのルートを WalkRoute 形式に変換してナビ開始
    const route = {
      routeId: fav.favoriteId,
      polyline: fav.polyline,
      distanceMeters: fav.distanceMeters,
      durationSeconds: fav.durationSeconds,
      walkScore: 0,
      scoreDetail: { nature: 0, park: 0, river: 0, quiet: 0 },
      steps: [],
    };
    selectRoute(route);
    startNavigation(route, fav.origin);
    router.push('/navigation');
  };

  if (!fav) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const coords = decodePolyline(fav.polyline).map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  const midLat = (fav.origin.latitude + fav.destination.latitude) / 2;
  const midLng = (fav.origin.longitude + fav.destination.longitude) / 2;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{ latitude: midLat, longitude: midLng, ...DEFAULT_MAP_DELTA }}
      >
        {coords.length > 0 && (
          <Polyline coordinates={coords} strokeColor={COLORS.primary} strokeWidth={4} />
        )}
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.name}>{fav.name}</Text>
        <Text style={styles.route}>
          {fav.originName} → {fav.destinationName}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatDistance(fav.distanceMeters)}</Text>
            <Text style={styles.statLabel}>距離</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatDuration(fav.durationSeconds)}</Text>
            <Text style={styles.statLabel}>所要時間</Text>
          </View>
        </View>

        {fav.priorities.length > 0 && (
          <View style={styles.tagRow}>
            {fav.priorities.map((p) => (
              <View key={p} style={styles.tag}>
                <Text style={styles.tagText}>{PRIORITY_LABELS[p]}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartNav}
          accessibilityRole="button"
          accessibilityLabel="このルートでナビを開始"
        >
          <Text style={styles.startButtonText}>このルートでナビを開始</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PRIORITY_LABELS: Record<string, string> = {
  nature: '🌿 自然',
  park: '🌸 公園',
  river: '🌊 川沿い',
  quiet: '🔇 静か',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  map: { flex: 1 },
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
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  route: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 },
  statsRow: { flexDirection: 'row', marginBottom: 12, gap: 24 },
  stat: {},
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  tag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, color: COLORS.primary },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
});
