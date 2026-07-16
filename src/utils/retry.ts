type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
};

type MaybeAppError = { recoverable?: boolean };

/**
 * 指数バックオフ付きの再試行ユーティリティ
 * - recoverable: false のエラーはすぐに再 throw（再試行しない）
 * - maxAttempts 回失敗したら最後のエラーを throw
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 2, baseDelayMs = 1000 } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;

      // recoverable: false はすぐに throw
      const err = e as MaybeAppError;
      if ('recoverable' in (err as object) && err.recoverable === false) {
        throw e;
      }

      // 最後の試行なら throw
      if (attempt === maxAttempts - 1) break;

      // 指数バックオフ待機（2^attempt * baseDelayMs）
      const delay = Math.pow(2, attempt) * baseDelayMs;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
