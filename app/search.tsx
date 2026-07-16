import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { searchPlaces, getPlaceDetail } from '../src/services/maps/places';
import { useRouteStore } from '../src/stores/routeStore';
import { COLORS } from '../src/constants/colors';
import type { PlacePrediction } from '../src/types/places';

// S-06: 目的地検索画面
export default function SearchScreen() {
  const router = useRouter();
  const setDestination = useRouteStore((s) => s.setDestination);

  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      setError(null);
      if (debounceTimer) clearTimeout(debounceTimer);

      if (!text.trim()) {
        setPredictions([]);
        return;
      }

      const timer = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await searchPlaces(text);
          setPredictions(results);
        } catch {
          setError('検索中にエラーが発生しました');
          setPredictions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
      setDebounceTimer(timer);
    },
    [debounceTimer],
  );

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    setIsLoading(true);
    try {
      const detail = await getPlaceDetail(prediction.placeId);
      setDestination(detail);
      router.push('/route-options');
    } catch {
      setError('場所の情報を取得できませんでした');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleChangeText}
          placeholder="目的地を入力..."
          placeholderTextColor={COLORS.textDisabled}
          autoFocus
          returnKeyType="search"
          accessibilityLabel="目的地を入力"
        />
        {isLoading && <ActivityIndicator style={styles.loader} color={COLORS.primary} />}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={predictions}
        keyExtractor={(item) => item.placeId}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelectPlace(item)}
            accessibilityRole="button"
            accessibilityLabel={item.description}
          >
            <Text style={styles.mainText} numberOfLines={1}>
              {item.mainText}
            </Text>
            <Text style={styles.secondaryText} numberOfLines={1}>
              {item.secondaryText}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          query.trim() && !isLoading ? (
            <Text style={styles.emptyText}>候補が見つかりませんでした</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  loader: { marginLeft: 8 },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  errorText: { color: COLORS.error, fontSize: 14 },
  item: { paddingHorizontal: 16, paddingVertical: 14 },
  mainText: { fontSize: 16, color: COLORS.textPrimary, marginBottom: 2 },
  secondaryText: { fontSize: 13, color: COLORS.textSecondary },
  separator: { height: 1, backgroundColor: COLORS.border, marginLeft: 16 },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 32,
    fontSize: 14,
  },
});
