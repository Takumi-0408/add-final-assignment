import { View, Text, StyleSheet } from 'react-native';

// S-03: ログイン画面 — Task 2 で実装
export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text>ログイン</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
