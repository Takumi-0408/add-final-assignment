import { View, Text, StyleSheet } from 'react-native';

// S-11: お気に入り一覧画面 — Task 7 で実装
export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text>お気に入り一覧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
