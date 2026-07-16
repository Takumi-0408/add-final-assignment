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
    // initialize は同期的に unsubscribe を返す
    const unsubscribe = initialize();

    AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED).then((val) => {
      router.replace(val ? '/(tabs)' : '/onboarding');
    });

    return unsubscribe;
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
