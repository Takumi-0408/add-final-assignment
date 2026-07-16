import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants/colors';

// S-13: マイページ画面
export default function MyPageScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // 未ログイン
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.guestTitle}>ログインしていません</Text>
        <Text style={styles.guestSubText}>
          ログインするとお気に入りの保存やルート履歴が使えます
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
          accessibilityRole="button"
          accessibilityLabel="ログインする"
        >
          <Text style={styles.loginButtonText}>ログイン / 新規登録</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* プロフィール */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          {user.displayName && <Text style={styles.displayName}>{user.displayName}</Text>}
          <Text style={styles.email}>{user.email ?? '匿名ユーザー'}</Text>
        </View>
      </View>

      {/* メニュー */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="設定"
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuLabel}>設定</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>
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
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  guestSubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: COLORS.surface },
  profileInfo: { flex: 1 },
  displayName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  email: { fontSize: 13, color: COLORS.textSecondary },
  menuSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  menuArrow: { fontSize: 20, color: COLORS.textDisabled },
});
