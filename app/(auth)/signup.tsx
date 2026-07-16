import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants/colors';

// S-04: サインアップ画面
export default function SignupScreen() {
  const router = useRouter();
  const { signUpWithEmail, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignup = async () => {
    setLocalError(null);
    clearError();

    if (password !== confirm) {
      setLocalError('パスワードが一致しません');
      return;
    }
    if (password.length < 6) {
      setLocalError('パスワードは6文字以上で入力してください');
      return;
    }

    await signUpWithEmail(email, password);
    if (!useAuthStore.getState().error) {
      router.replace('/(tabs)');
    }
  };

  const displayError = localError ?? error?.message ?? null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>アカウント登録</Text>

        {displayError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="example@mail.com"
            placeholderTextColor={COLORS.textDisabled}
            accessibilityLabel="メールアドレス"
          />

          <Text style={styles.label}>パスワード</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            placeholder="6文字以上"
            placeholderTextColor={COLORS.textDisabled}
            accessibilityLabel="パスワード"
          />

          <Text style={styles.label}>パスワード（確認）</Text>
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            textContentType="newPassword"
            placeholder="もう一度入力"
            placeholderTextColor={COLORS.textDisabled}
            accessibilityLabel="パスワード確認"
          />

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabled]}
            onPress={handleSignup}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="登録する"
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <Text style={styles.primaryButtonText}>登録する</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          accessibilityRole="link"
          accessibilityLabel="ログイン画面へ"
        >
          <Text style={styles.linkText}>すでにアカウントをお持ちの方はこちら</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 32,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    textAlign: 'center',
  },
});
