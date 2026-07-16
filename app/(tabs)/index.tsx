import { useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useCurrentLocation } from '../../src/hooks/useCurrentLocation';
import { DEFAULT_MAP_DELTA } from '../../src/constants/location';
import { COLORS } from '../../src/constants/colors';
import type { LatLng } from '../../src/hooks/locationUtils';

// ─── 地図を memo 化して位置更新ごとの不要な再レンダリングを抑制 ─────────────

type MapSectionProps = {
  location: LatLng;
  hasPermission: boolean;
};

const MapSection = memo(function MapSection({ location, hasPermission }: MapSectionProps) {
  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      region={{
        latitude: location.latitude,
        longitude: location.longitude,
        ...DEFAULT_MAP_DELTA,
      }}
      showsUserLocation={hasPermission}
      followsUserLocation={hasPermission}
      // 地図の移動・ズームアニメーションを有効化
      moveOnMarkerPress={false}
      showsCompass={false}
      toolbarEnabled={false}
    >
      {!hasPermission && (
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="デフォルト地点（東京駅）"
        />
      )}
    </MapView>
  );
});

// S-05: ホーム（地図）画面
export default function HomeScreen() {
  const router = useRouter();
  const { location, hasPermission, isLoading } = useCurrentLocation();

  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  const handleSearchPress = useCallback(() => {
    router.push('/search');
  }, [router]);

  return (
    <View style={styles.container}>
      <MapSection location={location} hasPermission={hasPermission} />

      {/* 検索バー */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={handleSearchPress}
        accessibilityRole="search"
        accessibilityLabel="目的地を検索"
      >
        <Text style={styles.searchPlaceholder}>目的地を検索...</Text>
      </TouchableOpacity>

      {/* 権限拒否バナー */}
      {!hasPermission && !isLoading && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>現在地を使用するには位置情報の許可が必要です</Text>
          <TouchableOpacity onPress={openSettings} accessibilityRole="button">
            <Text style={styles.permissionLink}>設定を開く</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  permissionBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: COLORS.warning,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionText: {
    flex: 1,
    color: COLORS.surface,
    fontSize: 13,
    marginRight: 8,
  },
  permissionLink: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
