import { View, Text, StyleSheet } from 'react-native';

// S-06: 目的地検索画面 — Task 3 で実装
export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text>目的地を検索</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
