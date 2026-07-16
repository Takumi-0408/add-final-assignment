import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'ログイン' }} />
      <Stack.Screen name="signup" options={{ title: 'アカウント登録' }} />
    </Stack>
  );
}
