import { View, Text, StyleSheet } from 'react-native';

// S-14: 設定画面 — Task 8 で実装
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>設定</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
