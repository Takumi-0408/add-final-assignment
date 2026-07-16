import { View, Text, StyleSheet } from 'react-native';

// S-10: 散歩サマリー画面 — Task 7 で実装
export default function SummaryScreen() {
  return (
    <View style={styles.container}>
      <Text>散歩サマリー</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
