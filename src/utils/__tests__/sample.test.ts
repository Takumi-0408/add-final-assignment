/**
 * セットアップ確認用サンプルテスト
 * Jest + TypeScript が正しく動作することを確認する
 */

describe('Jest セットアップ確認', () => {
  it('TypeScript の strict モードが有効な環境でテストが動作すること', () => {
    const value = 'hello';
    expect(value).toBe('hello');
  });

  it('非同期テストが動作すること', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
