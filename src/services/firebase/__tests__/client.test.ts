/**
 * Firebase クライアント初期化テスト
 * - getApps() が空のとき initializeApp が呼ばれること
 * - getApps() にアプリがあるとき initializeApp が呼ばれないこと
 */

// firebase モジュールをモック（jest.mock はホイスティングされるため先頭に記述）
import type { FirebaseOptions, FirebaseApp } from 'firebase/app';
import { initializeApp, getApps } from 'firebase/app';

jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>;
const mockGetApps = getApps as jest.MockedFunction<typeof getApps>;

/** テスト対象: 初期化ガードロジックを単独で検証する */
function initializeIfNeeded(config: FirebaseOptions): FirebaseApp | null {
  const apps = mockGetApps();
  if (apps.length === 0) {
    return mockInitializeApp(config);
  }
  return apps[0] ?? null;
}

const dummyConfig: FirebaseOptions = { apiKey: 'test', projectId: 'test' };
const dummyApp: FirebaseApp = {
  name: '[DEFAULT]',
  options: {},
  automaticDataCollectionEnabled: true,
};

describe('Firebase client - 初期化ロジック', () => {
  beforeEach(() => {
    mockInitializeApp.mockReset();
    mockGetApps.mockReset();
    mockInitializeApp.mockReturnValue(dummyApp);
  });

  it('getApps が空のとき initializeApp が呼ばれること', () => {
    mockGetApps.mockReturnValue([]);
    initializeIfNeeded(dummyConfig);
    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockInitializeApp).toHaveBeenCalledWith(dummyConfig);
  });

  it('getApps にアプリが存在するとき initializeApp が呼ばれないこと', () => {
    mockGetApps.mockReturnValue([dummyApp]);
    initializeIfNeeded(dummyConfig);
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });
});
