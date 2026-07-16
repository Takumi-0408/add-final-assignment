/**
 * ErrorBoundary のロジックテスト
 * React コンポーネントのレンダリングには依存しない純粋関数部分を検証する
 */
import { shouldShowRecovery, formatErrorForUser } from '../errorBoundaryUtils';

describe('shouldShowRecovery', () => {
  it('recoverable: true のとき true を返す', () => {
    expect(shouldShowRecovery({ code: 'test', message: '', recoverable: true })).toBe(true);
  });

  it('recoverable: false のとき false を返す', () => {
    expect(shouldShowRecovery({ code: 'test', message: '', recoverable: false })).toBe(false);
  });

  it('AppError でない場合は true（再試行可能として扱う）', () => {
    expect(shouldShowRecovery(null)).toBe(true);
    expect(shouldShowRecovery(undefined)).toBe(true);
    expect(shouldShowRecovery(new Error('oops'))).toBe(true);
  });
});

describe('formatErrorForUser', () => {
  it('AppError の message をそのまま返す', () => {
    const err = { code: 'test', message: 'カスタムメッセージ', recoverable: true };
    expect(formatErrorForUser(err)).toBe('カスタムメッセージ');
  });

  it('Error オブジェクトのとき汎用メッセージを返す', () => {
    const msg = formatErrorForUser(new Error('js error'));
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('null/undefined のとき汎用メッセージを返す', () => {
    expect(typeof formatErrorForUser(null)).toBe('string');
  });
});
