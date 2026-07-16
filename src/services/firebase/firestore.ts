import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './client';
import type { Favorite, FavoriteInput } from '../../types/favorites';
import type { AppError } from '../../utils/error';
import { withRetry } from '../../utils/retry';

/** Firestore エラーコードを AppError に変換 */
function toFirestoreError(e: unknown): AppError {
  const err = e as { code?: string; message?: string };
  const code = err.code ?? 'unknown';
  const fsCode = `firestore/${code}`;

  const messageMap: Record<string, string> = {
    'firestore/permission-denied': '権限がありません。再ログインをお試しください',
    'firestore/unavailable': 'サービスが一時的に利用できません。しばらく後にお試しください',
    'firestore/not-found': 'データが見つかりませんでした',
  };

  return {
    code: fsCode,
    message: messageMap[fsCode] ?? 'データの操作中にエラーが発生しました',
    recoverable: code !== 'permission-denied',
  };
}

/** Firestore エラー変換 + 指数バックオフ再試行ラッパー */
async function withFirestoreError<T>(fn: () => Promise<T>): Promise<T> {
  return withRetry(
    async () => {
      try {
        return await fn();
      } catch (e) {
        throw toFirestoreError(e);
      }
    },
    { maxAttempts: 2, baseDelayMs: 500 },
  );
}

/** お気に入りを保存し、生成された favoriteId を返す */
export async function saveFavorite(uid: string, data: FavoriteInput): Promise<string> {
  return withFirestoreError(async () => {
    const col = collection(db, 'users', uid, 'favorites');
    const ref = await addDoc(col, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  });
}

/** お気に入り一覧を新着順で取得する */
export async function getFavorites(uid: string): Promise<Favorite[]> {
  return withFirestoreError(async () => {
    const col = collection(db, 'users', uid, 'favorites');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        favoriteId: d.id,
        name: data['name'] as string,
        origin: data['origin'] as { latitude: number; longitude: number },
        originName: data['originName'] as string,
        destination: data['destination'] as { latitude: number; longitude: number },
        destinationName: data['destinationName'] as string,
        polyline: data['polyline'] as string,
        distanceMeters: data['distanceMeters'] as number,
        durationSeconds: data['durationSeconds'] as number,
        priorities: data['priorities'] as Favorite['priorities'],
        createdAt: (data['createdAt'] as { toDate: () => Date }).toDate(),
      };
    });
  });
}

/** お気に入りを削除する */
export async function deleteFavorite(uid: string, favoriteId: string): Promise<void> {
  return withFirestoreError(async () => {
    const ref = doc(db, 'users', uid, 'favorites', favoriteId);
    await deleteDoc(ref);
  });
}
