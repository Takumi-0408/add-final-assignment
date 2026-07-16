import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS } from '../src/constants/colors';
import { STORAGE_KEYS } from '../src/constants/app';

// S-01: スプラッシュ / ルートリダイレクト
export default function SplashScreen() {
  const router = useRouter();
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const bootstrap = async () => {
      // 認証状態の購読を開始
      unsubscribe = initialize();

      // 初回起動判定
      const onboardingCompleted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);

      if (!onboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    };

    bootstrap();

    return () => {
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
