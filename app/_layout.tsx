import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ title: '目的地を検索' }} />
      <Stack.Screen name="route-options" options={{ title: 'ルート検索条件' }} />
      <Stack.Screen name="route-suggestions" options={{ title: 'ルート提案' }} />
      <Stack.Screen name="navigation" options={{ headerShown: false }} />
      <Stack.Screen name="summary" options={{ title: '散歩サマリー' }} />
      <Stack.Screen name="settings" options={{ title: '設定' }} />
    </Stack>
  );
}
