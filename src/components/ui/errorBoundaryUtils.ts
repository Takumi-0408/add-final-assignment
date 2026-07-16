/** ErrorBoundary のテスト可能な純粋関数 */

/** エラーが回復可能かどうか判定する */
export function shouldShowRecovery(error: unknown): boolean {
  if (error === null || error === undefined) return true;
  if (typeof error === 'object' && 'recoverable' in (error as object)) {
    return (error as { recoverable?: boolean }).recoverable ?? true;
  }
  return true;
}

/** ユーザー向けのエラーメッセージを返す */
export function formatErrorForUser(error: unknown): string {
  if (error === null || error === undefined) {
    return '予期しないエラーが発生しました';
  }
  if (typeof error === 'object' && 'message' in (error as object)) {
    const msg = (error as { message?: string }).message;
    if (msg && typeof msg === 'string') return msg;
  }
  return '予期しないエラーが発生しました。アプリを再起動してください';
}
