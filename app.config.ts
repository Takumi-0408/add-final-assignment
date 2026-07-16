import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '散歩ナビ',
  slug: 'walk-navi',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'walk-navi',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.example.walknavi',
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#E6F4FE',
    },
    package: 'com.example.walknavi',
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY,
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: '散歩ルートの案内に現在地を使用します。',
        locationWhenInUsePermission: '散歩ルートの案内に現在地を使用します。',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // プライバシーポリシー・利用規約 URL（リリース前に実際の URL に変更）
    privacyPolicyUrl: 'https://example.com/privacy',
    termsOfServiceUrl: 'https://example.com/terms',
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? '',
    },
  },
});
