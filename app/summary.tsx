import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigationStore } from '../src/stores/navigationStore';
import { useRouteStore } from '../src/stores/routeStore';
import { useAuthStore } from '../src/stores/authStore';
import { useFavoritesStore } from '../src/stores/favoritesStore';
import { formatDistance, formatDuration } from '../src/utils/format';
import { COLORS } from '../src/constants/colors';

// S-10: 散歩サマリー画面
export default function SummaryScreen() {
  const router = useRouter();
  const { elapsedSeconds, walkedMeters, currentRoute, stopNavigation } = useNavigationStore();
  const { selectedRoute, destination, priorities } = useRouteStore();
  const { user } = useAuthStore();
  const { saveFavorite, isLoading: isSaving, error: saveError } = useFavoritesStore();

  const [routeName, setRouteName] = useState('');

  const route = currentRoute ?? selectedRoute;

  const handleSaveFavorite = async () => {
    if (!user) {
      Alert.alert('ログインが必要です', 'お気に入りを保存するにはログインしてください', [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'ログイン', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (!route || !destination) {
      Alert.alert('保存できません', 'ルート情報が見つかりませんでした');
      return;
    }

    await saveFavorite(user.uid, {
      name: routeName.trim() || 'お気に入りルート',
      origin: { latitude: 35.6812, longitude: 139.7671 }, // TODO: 実際の出発地を使用
      originName: '出発地点',
      destination: destination.location,
      destinationName: destination.name,
      polyline: route.polyline,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds,
      priorities,
    });

    if (!useFavoritesStore.getState().error) {
      Alert.alert('保存しました', `「${routeName.trim() || 'お気に入りルート'}」を保存しました`);
    }
  };

  const handleClose = () => {
    stopNavigation();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>散歩おつかれさまでした！</Text>

      {/* 統計 */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatDistance(walkedMeters > 0 ? walkedMeters : (route?.distanceMeters ?? 0))}
          </Text>
          <Text style={styles.statLabel}>歩行距離</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatDuration(elapsedSeconds > 0 ? elapsedSeconds : (route?.durationSeconds ?? 0))}
          </Text>
          <Text style={styles.statLabel}>所要時間</Text>
        </View>
        {route && (
          <>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>{route.walkScore}</Text>
              <Text style={styles.statLabel}>散歩スコア</Text>
            </View>
          </>
        )}
      </View>

      {/* お気に入り保存 */}
      <View style={styles.favoriteSection}>
        <Text style={styles.sectionLabel}>このルートを保存する（任意）</Text>
        <TextInput
          style={styles.nameInput}
          value={routeName}
          onChangeText={setRouteName}
          placeholder="ルート名を入力（例: 朝の公園コース）"
          placeholderTextColor={COLORS.textDisabled}
          maxLength={50}
          accessibilityLabel="ルート名"
        />
        {saveError && <Text style={styles.errorText}>{saveError.message}</Text>}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabled]}
          onPress={handleSaveFavorite}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="お気に入りに保存"
        >
          <Text style={styles.saveButtonText}>{isSaving ? '保存中...' : 'お気に入りに保存'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="ホームに戻る"
      >
        <Text style={styles.closeButtonText}>ホームに戻る</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 32,
    textAlign: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  divider: { width: 1, backgroundColor: COLORS.border },
  favoriteSection: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  nameInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  errorText: { color: COLORS.error, fontSize: 13, marginBottom: 8 },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: { color: COLORS.surface, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  closeButton: { paddingVertical: 14, alignItems: 'center' },
  closeButtonText: { color: COLORS.textSecondary, fontSize: 15 },
});
