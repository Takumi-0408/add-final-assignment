import { View, Text, StyleSheet } from 'react-native';

// S-07: ルート検索条件画面 — Task 4 で実装
export default function RouteOptionsScreen() {
  return (
    <View style={styles.container}>
      <Text>ルート検索条件</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
