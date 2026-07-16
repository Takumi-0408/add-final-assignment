import { View, Text, StyleSheet } from 'react-native';

// S-05: ホーム（地図）画面 — Task 1 で実装
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>ホーム（地図）</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
