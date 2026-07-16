/** アプリ共通エラー型 */
export type AppError = {
  code: string;
  message: string; // ユーザー向け日本語メッセージ
  recoverable: boolean;
};

/** Firebase Auth エラーコード → 日本語メッセージ マッピング */
const AUTH_ERROR_MAP: Record<string, { message: string; recoverable: boolean }> = {
  'auth/email-already-in-use': {
    message: 'このメールアドレスはすでに使用されています',
    recoverable: true,
  },
  'auth/invalid-email': {
    message: '有効なメールアドレスを入力してください',
    recoverable: true,
  },
  'auth/invalid-credential': {
    message: 'メールアドレスまたはパスワードが正しくありません',
    recoverable: true,
  },
  'auth/wrong-password': {
    message: 'パスワードが正しくありません',
    recoverable: true,
  },
  'auth/user-not-found': {
    message: 'アカウントが見つかりませんでした',
    recoverable: true,
  },
  'auth/weak-password': {
    message: 'パスワードは6文字以上で入力してください',
    recoverable: true,
  },
  'auth/network-request-failed': {
    message: 'ネットワークエラーが発生しました。再試行してください',
    recoverable: true,
  },
  'auth/too-many-requests': {
    message: 'しばらく時間をおいてから再試行してください',
    recoverable: true,
  },
  'auth/user-disabled': {
    message: 'このアカウントは無効化されています',
    recoverable: false,
  },
  'auth/requires-recent-login': {
    message: '再ログインが必要です',
    recoverable: true,
  },
  'auth/credential-already-in-use': {
    message: 'このアカウントはすでに別のユーザーに紐付いています',
    recoverable: false,
  },
};

const FALLBACK_ERROR = { message: '認証エラーが発生しました', recoverable: false };

/**
 * Firebase エラー or エラーコード文字列を AppError に変換する
 */
export function toAppError(input: unknown): AppError {
  let code = 'unknown/error';

  if (typeof input === 'string') {
    code = input;
  } else if (input !== null && typeof input === 'object' && 'code' in input) {
    code = String((input as { code: unknown }).code);
  }

  const mapped = AUTH_ERROR_MAP[code] ?? FALLBACK_ERROR;
  return { code, ...mapped };
}
