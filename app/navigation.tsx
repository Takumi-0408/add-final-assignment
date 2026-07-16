import { View, Text, StyleSheet } from 'react-native';

// S-09: ナビゲーション画面 — Task 6 で実装
export default function NavigationScreen() {
  return (
    <View style={styles.container}>
      <Text>ナビゲーション</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
