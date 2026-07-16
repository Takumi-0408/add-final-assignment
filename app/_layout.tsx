import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ title: '目的地を検索', headerBackTitle: '戻る' }} />
        <Stack.Screen
          name="route-options"
          options={{ title: 'ルート検索条件', headerBackTitle: '戻る' }}
        />
        <Stack.Screen
          name="route-suggestions"
          options={{ title: 'ルート提案', headerBackTitle: '戻る' }}
        />
        <Stack.Screen name="navigation" options={{ headerShown: false }} />
        <Stack.Screen name="summary" options={{ title: '散歩サマリー', headerBackTitle: '戻る' }} />
        <Stack.Screen name="settings" options={{ title: '設定', headerBackTitle: '戻る' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
