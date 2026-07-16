import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS } from '../src/constants/colors';

// S-14: 設定画面
export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleOpenLocationSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleSignOut = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'アカウント削除',
      'アカウントを削除するとすべてのデータが失われます。本当に削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => {
            // TODO: Task 8-1 (Cloud Function) で実装
            Alert.alert('未実装', 'アカウント削除は現在準備中です');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* 位置情報 */}
      <Text style={styles.sectionLabel}>位置情報</Text>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.item}
          onPress={handleOpenLocationSettings}
          accessibilityRole="button"
          accessibilityLabel="位置情報の設定を開く"
        >
          <Text style={styles.itemLabel}>位置情報の設定を変更</Text>
          <Text style={styles.itemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* アカウント */}
      {user && (
        <>
          <Text style={styles.sectionLabel}>アカウント</Text>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.item}
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="ログアウト"
            >
              <Text style={styles.itemLabel}>ログアウト</Text>
              <Text style={styles.itemArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.itemSeparator} />

            <TouchableOpacity
              style={styles.item}
              onPress={handleDeleteAccount}
              accessibilityRole="button"
              accessibilityLabel="アカウントを削除"
            >
              <Text style={[styles.itemLabel, styles.danger]}>アカウントを削除</Text>
              <Text style={styles.itemArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Text style={styles.version}>散歩ナビ v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemLabel: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  itemArrow: { fontSize: 20, color: COLORS.textDisabled },
  itemSeparator: { height: 1, backgroundColor: COLORS.border, marginLeft: 16 },
  danger: { color: COLORS.error },
  version: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textDisabled,
  },
});
