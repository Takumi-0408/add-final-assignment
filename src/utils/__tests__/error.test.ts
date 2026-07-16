import { toAppError, type AppError } from '../error';

describe('toAppError', () => {
  it('auth/email-already-in-use を正しいメッセージに変換する', () => {
    const err = toAppError('auth/email-already-in-use');
    expect(err.code).toBe('auth/email-already-in-use');
    expect(err.message).toContain('メールアドレス');
    expect(err.recoverable).toBe(true);
  });

  it('auth/wrong-password を正しいメッセージに変換する', () => {
    const err = toAppError('auth/wrong-password');
    expect(err.message).toContain('パスワード');
  });

  it('auth/user-not-found を正しいメッセージに変換する', () => {
    const err = toAppError('auth/user-not-found');
    expect(err.message).toContain('アカウント');
  });

  it('auth/network-request-failed は recoverable: true', () => {
    const err = toAppError('auth/network-request-failed');
    expect(err.recoverable).toBe(true);
  });

  it('auth/invalid-credential を正しいメッセージに変換する', () => {
    const err = toAppError('auth/invalid-credential');
    expect(err.message).toBeTruthy();
  });

  it('未知のコードはフォールバックメッセージを返す', () => {
    const err = toAppError('unknown/error');
    expect(err.code).toBe('unknown/error');
    expect(err.message).toBeTruthy();
    expect(err.recoverable).toBe(false);
  });

  it('Error オブジェクトから変換できる', () => {
    const firebaseError = Object.assign(new Error('test'), { code: 'auth/invalid-email' });
    const err = toAppError(firebaseError);
    expect(err.code).toBe('auth/invalid-email');
    expect(err.message).toContain('メールアドレス');
  });
});

describe('AppError 型', () => {
  it('AppError は code, message, recoverable を持つ', () => {
    const err: AppError = { code: 'test', message: 'テスト', recoverable: false };
    expect(err).toHaveProperty('code');
    expect(err).toHaveProperty('message');
    expect(err).toHaveProperty('recoverable');
  });
});
