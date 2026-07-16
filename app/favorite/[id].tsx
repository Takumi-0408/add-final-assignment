import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// S-12: お気に入り詳細画面 — Task 7 で実装
export default function FavoriteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <Text>お気に入り詳細: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
