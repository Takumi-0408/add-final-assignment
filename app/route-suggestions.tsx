import { View, Text, StyleSheet } from 'react-native';

// S-08: ルート提案画面 — Task 5 で実装
export default function RouteSuggestionsScreen() {
  return (
    <View style={styles.container}>
      <Text>ルート提案</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
