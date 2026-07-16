import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { shouldShowRecovery, formatErrorForUser } from './errorBoundaryUtils';
export { shouldShowRecovery, formatErrorForUser } from './errorBoundaryUtils';

// ─── ErrorBoundary コンポーネント ────────────────────────────────────────────

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: unknown;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // TODO: Sentry 等へのエラー送信（将来実装）
    console.warn('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const message = formatErrorForUser(this.state.error);
    const recoverable = shouldShowRecovery(this.state.error);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>エラーが発生しました</Text>
        <Text style={styles.message}>{message}</Text>
        {recoverable && (
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleReset}
            accessibilityRole="button"
            accessibilityLabel="再試行する"
          >
            <Text style={styles.buttonText}>再試行する</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: '700',
  },
});
