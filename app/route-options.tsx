import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRouteStore } from '../src/stores/routeStore';
import { useCurrentLocation } from '../src/hooks/useCurrentLocation';
import { COLORS } from '../src/constants/colors';
import type { Priority } from '../src/types/places';

const PRIORITY_OPTIONS: { value: Priority; label: string; emoji: string }[] = [
  { value: 'nature', label: '自然・緑地', emoji: '🌿' },
  { value: 'park', label: '公園', emoji: '🌸' },
  { value: 'river', label: '川沿い', emoji: '🌊' },
  { value: 'quiet', label: '静かな道', emoji: '🔇' },
];

const DURATION_OPTIONS = [
  { label: '指定なし', value: null },
  { label: '15分', value: 15 },
  { label: '30分', value: 30 },
  { label: '60分', value: 60 },
  { label: '90分', value: 90 },
];

// S-07: ルート検索条件画面
export default function RouteOptionsScreen() {
  const router = useRouter();
  const {
    destination,
    priorities,
    maxDurationMinutes,
    setPriorities,
    setMaxDuration,
    searchRoutes,
    isSearching,
  } = useRouteStore();
  const { location } = useCurrentLocation();

  const togglePriority = (p: Priority) => {
    if (priorities.includes(p)) {
      setPriorities(priorities.filter((x) => x !== p));
    } else {
      setPriorities([...priorities, p]);
    }
  };

  const handleSearch = async () => {
    await searchRoutes(location);
    if (!useRouteStore.getState().searchError) {
      router.push('/route-suggestions');
    }
  };

  const searchError = useRouteStore((s) => s.searchError);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 目的地 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>目的地</Text>
        <Text style={styles.destinationName}>{destination?.name ?? '未設定'}</Text>
        {destination?.address ? (
          <Text style={styles.destinationAddress}>{destination.address}</Text>
        ) : null}
      </View>

      {/* 優先条件 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>優先条件（複数選択可）</Text>
        {PRIORITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.priorityRow, priorities.includes(opt.value) && styles.prioritySelected]}
            onPress={() => togglePriority(opt.value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: priorities.includes(opt.value) }}
            accessibilityLabel={opt.label}
          >
            <Text style={styles.priorityEmoji}>{opt.emoji}</Text>
            <Text style={styles.priorityLabel}>{opt.label}</Text>
            <View style={[styles.check, priorities.includes(opt.value) && styles.checkActive]}>
              {priorities.includes(opt.value) && <Text style={styles.checkMark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 所要時間 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>希望所要時間</Text>
        <View style={styles.durationRow}>
          {DURATION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={String(opt.value)}
              style={[
                styles.durationChip,
                maxDurationMinutes === opt.value && styles.durationChipActive,
              ]}
              onPress={() => setMaxDuration(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: maxDurationMinutes === opt.value }}
            >
              <Text
                style={[
                  styles.durationChipText,
                  maxDurationMinutes === opt.value && styles.durationChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* エラー */}
      {searchError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{searchError.message}</Text>
        </View>
      )}

      {/* 検索ボタン */}
      <TouchableOpacity
        style={[styles.searchButton, (!destination || isSearching) && styles.disabled]}
        onPress={handleSearch}
        disabled={!destination || isSearching}
        accessibilityRole="button"
        accessibilityLabel="ルートを検索する"
      >
        <Text style={styles.searchButtonText}>
          {isSearching ? '検索中...' : 'ルートを検索する'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  destinationName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  destinationAddress: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  prioritySelected: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  priorityEmoji: { fontSize: 20, marginRight: 12 },
  priorityLabel: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  checkMark: { color: COLORS.surface, fontSize: 12, fontWeight: '700' },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  durationChipActive: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  durationChipText: { fontSize: 14, color: COLORS.textSecondary },
  durationChipTextActive: { color: COLORS.primary, fontWeight: '600' },
  errorBox: { marginBottom: 16, padding: 12, backgroundColor: '#FEF2F2', borderRadius: 8 },
  errorText: { color: COLORS.error, fontSize: 14 },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  searchButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
});
