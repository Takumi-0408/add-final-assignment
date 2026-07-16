import { withRetry } from '../retry';

describe('withRetry', () => {
  it('初回成功のとき1回だけ実行される', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 2 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('1回失敗後に成功するとき2回実行される', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce({ code: 'test', message: 'err', recoverable: true })
      .mockResolvedValue('ok');

    const result = await withRetry(fn, { maxAttempts: 2, baseDelayMs: 0 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('maxAttempts 回失敗後に最後のエラーを throw する', async () => {
    const err = { code: 'test', message: 'fail', recoverable: true };
    const fn = jest.fn().mockRejectedValue(err);

    // baseDelayMs: 0 でタイマー待機なし
    await expect(withRetry(fn, { maxAttempts: 2, baseDelayMs: 0 })).rejects.toMatchObject({
      code: 'test',
    });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('recoverable: false のエラーはすぐに throw する（再試行しない）', async () => {
    const err = { code: 'fatal', message: 'fatal error', recoverable: false };
    const fn = jest.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { maxAttempts: 3 })).rejects.toMatchObject({ code: 'fatal' });
    // recoverable: false なので再試行せず1回のみ
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
