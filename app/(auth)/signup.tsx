import { View, Text, StyleSheet } from 'react-native';

// S-04: サインアップ画面 — Task 2 で実装
export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <Text>アカウント登録</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
