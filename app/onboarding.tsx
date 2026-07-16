import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../src/constants/colors';
import { STORAGE_KEYS } from '../src/constants/app';

// S-02: オンボーディング画面
export default function OnboardingScreen() {
  const router = useRouter();

  const handleStart = async () => {
    await Location.requestForegroundPermissionsAsync();
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>散歩ナビへようこそ</Text>
        <Text style={styles.subtitle}>
          景色のいい道、公園、川沿いなど{'\n'}「歩くこと」を楽しめるルートを提案します
        </Text>

        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.permissionNote}>ルート案内のために位置情報の使用許可が必要です</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStart}
          accessibilityRole="button"
          accessibilityLabel="位置情報を許可してはじめる"
        >
          <Text style={styles.primaryButtonText}>位置情報を許可してはじめる</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} accessibilityRole="button">
          <Text style={styles.skipText}>後で設定する</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FEATURES = [
  { icon: '🌿', label: '自然・緑地を優先したルート' },
  { icon: '🌸', label: '公園・川沿いを通るルート' },
  { icon: '🔇', label: '静かな道を優先' },
  { icon: '❤️', label: 'お気に入りルートを保存' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 40,
  },
  featureList: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  permissionNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    gap: 16,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
