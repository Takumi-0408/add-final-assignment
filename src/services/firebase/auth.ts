import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  linkWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './client';
import { toAppError } from '../../utils/error';

/** Firebase Auth 操作の共通エラーハンドラ */
async function withAuthError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    throw toAppError(e);
  }
}

/** 匿名認証 */
export async function signInAnonymous(): Promise<void> {
  await withAuthError(() => signInAnonymously(auth));
}

/** メール/パスワード認証 */
export async function signInWithEmail(email: string, password: string): Promise<void> {
  await withAuthError(() => signInWithEmailAndPassword(auth, email, password));
}

/** 新規ユーザー登録 */
export async function signUpWithEmail(email: string, password: string): Promise<void> {
  await withAuthError(() => createUserWithEmailAndPassword(auth, email, password));
}

/** サインアウト */
export async function signOut(): Promise<void> {
  await withAuthError(() => firebaseSignOut(auth));
}

/**
 * 匿名ユーザーをメール/パスワードアカウントに昇格
 * @param user 現在の匿名ユーザー
 */
export async function linkEmailToAnonymous(
  user: User,
  email: string,
  password: string,
): Promise<void> {
  const credential = EmailAuthProvider.credential(email, password);
  await withAuthError(() => linkWithCredential(user, credential));
}

/**
 * 認証状態の変化を購読する
 * @returns unsubscribe 関数
 */
export function subscribeAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
