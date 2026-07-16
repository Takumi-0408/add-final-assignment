/**
 * authStore テスト
 * Zustand ストアの状態遷移を検証する
 */

import { signInAnonymous, signInWithEmail, signOut } from '../../services/firebase/auth';
import { useAuthStore } from '../authStore';

jest.mock('../../services/firebase/auth');
jest.mock('../../services/firebase/client', () => ({ auth: {}, db: {} }));
jest.mock('firebase/auth');

const mockSignInAnon = signInAnonymous as jest.MockedFunction<typeof signInAnonymous>;
const mockSignInEmail = signInWithEmail as jest.MockedFunction<typeof signInWithEmail>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;

/** テストごとに初期状態にリセット */
beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, isLoading: false, error: null });
});

describe('authStore 初期状態', () => {
  it('user: null, isLoading: false, error: null であること', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe('signInAnonymous アクション', () => {
  it('呼び出し中は isLoading: true になる', async () => {
    let resolveSignIn!: () => void;
    mockSignInAnon.mockReturnValue(
      new Promise<void>((res) => {
        resolveSignIn = res;
      }),
    );

    const promise = useAuthStore.getState().signInAnonymous();
    expect(useAuthStore.getState().isLoading).toBe(true);

    resolveSignIn();
    await promise;
  });

  it('成功後は isLoading: false, error: null になる', async () => {
    mockSignInAnon.mockResolvedValue(undefined);
    await useAuthStore.getState().signInAnonymous();
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('失敗時は error がセットされ isLoading: false になる', async () => {
    const appErr = {
      code: 'auth/network-request-failed',
      message: 'ネットワークエラー',
      recoverable: true,
    };
    mockSignInAnon.mockRejectedValue(appErr);
    await useAuthStore.getState().signInAnonymous();
    const state = useAuthStore.getState();
    expect(state.error).toMatchObject({ code: 'auth/network-request-failed' });
    expect(state.isLoading).toBe(false);
  });
});

describe('signInWithEmail アクション', () => {
  it('成功後は error: null になる', async () => {
    mockSignInEmail.mockResolvedValue(undefined);
    await useAuthStore.getState().signInWithEmail('a@b.com', 'pass');
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('失敗時は error がセットされる', async () => {
    mockSignInEmail.mockRejectedValue({
      code: 'auth/wrong-password',
      message: 'パスワードが違います',
      recoverable: true,
    });
    await useAuthStore.getState().signInWithEmail('a@b.com', 'wrong');
    expect(useAuthStore.getState().error?.code).toBe('auth/wrong-password');
  });
});

describe('clearError アクション', () => {
  it('error が null になる', () => {
    useAuthStore.setState({ error: { code: 'test', message: 'err', recoverable: false } });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});

describe('signOut アクション', () => {
  it('signOut を呼び出し user: null になる', async () => {
    mockSignOut.mockResolvedValue(undefined);
    await useAuthStore.getState().signOut();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
