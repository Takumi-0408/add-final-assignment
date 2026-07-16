import { View, Text, StyleSheet } from 'react-native';

// S-13: マイページ画面 — Task 8 で実装
export default function MyPageScreen() {
  return (
    <View style={styles.container}>
      <Text>マイページ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
