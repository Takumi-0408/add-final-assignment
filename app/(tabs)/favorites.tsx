import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useFavoritesStore } from '../../src/stores/favoritesStore';
import { formatDistance, formatDuration } from '../../src/utils/format';
import { COLORS } from '../../src/constants/colors';
import type { Favorite } from '../../src/types/favorites';

// S-11: お気に入り一覧画面
export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { favorites, isLoading, error, fetchFavorites, deleteFavorite } = useFavoritesStore();

  // 未ログイン時はログイン画面へ
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    fetchFavorites(user.uid);
    // router・fetchFavorites は安定参照のため deps から除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = (fav: Favorite) => {
    if (!user) return;
    Alert.alert('削除の確認', `「${fav.name}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => deleteFavorite(user.uid, fav.favoriteId),
      },
    ]);
  };

  const handlePressItem = (fav: Favorite) => {
    router.push(`/favorite/${fav.favoriteId}`);
  };

  if (!user) return null;

  if (isLoading && favorites.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      <FlatList
        data={favorites}
        keyExtractor={(f) => f.favoriteId}
        contentContainerStyle={favorites.length === 0 ? styles.emptyContainer : styles.list}
        renderItem={({ item: fav }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePressItem(fav)}
            accessibilityRole="button"
            accessibilityLabel={fav.name}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {fav.name}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(fav)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`${fav.name}を削除`}
              >
                <Text style={styles.deleteIcon}>🗑</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.routeInfo}>
              {fav.destinationName} · {formatDistance(fav.distanceMeters)} ·{' '}
              {formatDuration(fav.durationSeconds)}
            </Text>

            {fav.priorities.length > 0 && (
              <View style={styles.tagRow}>
                {fav.priorities.map((p) => (
                  <View key={p} style={styles.tag}>
                    <Text style={styles.tagText}>{PRIORITY_LABELS[p]}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>保存したルートがありません</Text>
            <Text style={styles.emptySubText}>散歩後にルートを保存できます</Text>
          </View>
        }
      />
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
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: { margin: 16, padding: 12, backgroundColor: '#FEF2F2', borderRadius: 8 },
  errorText: { color: COLORS.error, fontSize: 14 },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  deleteIcon: { fontSize: 18 },
  routeInfo: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, color: COLORS.primary },
  separator: { height: 10 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 8 },
  emptySubText: { fontSize: 13, color: COLORS.textDisabled },
});
