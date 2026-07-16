import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'ホーム' }} />
      <Tabs.Screen name="favorites" options={{ title: 'お気に入り' }} />
      <Tabs.Screen name="mypage" options={{ title: 'マイページ' }} />
    </Tabs>
  );
}
