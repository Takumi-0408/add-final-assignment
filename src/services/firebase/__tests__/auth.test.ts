import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  linkWithCredential,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  signInAnonymous,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  linkEmailToAnonymous,
  subscribeAuthState,
} from '../auth';

jest.mock('firebase/auth');
jest.mock('../client', () => ({ auth: {}, db: {} }));

const mockSignInAnon = signInAnonymously as jest.MockedFunction<typeof signInAnonymously>;
const mockSignInEmail = signInWithEmailAndPassword as jest.MockedFunction<
  typeof signInWithEmailAndPassword
>;
const mockCreateUser = createUserWithEmailAndPassword as jest.MockedFunction<
  typeof createUserWithEmailAndPassword
>;
const mockSignOut = firebaseSignOut as jest.MockedFunction<typeof firebaseSignOut>;
const mockLinkWith = linkWithCredential as jest.MockedFunction<typeof linkWithCredential>;
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>;

const dummyUser = { uid: 'uid-1', email: 'test@example.com', isAnonymous: false };
const dummyCredential = { user: dummyUser };

beforeEach(() => {
  jest.resetAllMocks();
});

describe('signInAnonymous', () => {
  it('signInAnonymously を呼び出す', async () => {
    mockSignInAnon.mockResolvedValue(dummyCredential as never);
    await signInAnonymous();
    expect(mockSignInAnon).toHaveBeenCalledTimes(1);
  });

  it('Firebase エラーを AppError に変換する', async () => {
    const firebaseErr = Object.assign(new Error('fail'), { code: 'auth/network-request-failed' });
    mockSignInAnon.mockRejectedValue(firebaseErr);
    await expect(signInAnonymous()).rejects.toMatchObject({ code: 'auth/network-request-failed' });
  });
});

describe('signInWithEmail', () => {
  it('signInWithEmailAndPassword を正しい引数で呼び出す', async () => {
    mockSignInEmail.mockResolvedValue(dummyCredential as never);
    await signInWithEmail('test@example.com', 'password123');
    expect(mockSignInEmail).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123',
    );
  });

  it('Firebase エラーを AppError に変換する', async () => {
    const firebaseErr = Object.assign(new Error('fail'), { code: 'auth/wrong-password' });
    mockSignInEmail.mockRejectedValue(firebaseErr);
    await expect(signInWithEmail('a@b.com', 'wrong')).rejects.toMatchObject({
      code: 'auth/wrong-password',
    });
  });
});

describe('signUpWithEmail', () => {
  it('createUserWithEmailAndPassword を正しい引数で呼び出す', async () => {
    mockCreateUser.mockResolvedValue(dummyCredential as never);
    await signUpWithEmail('new@example.com', 'password123');
    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.anything(),
      'new@example.com',
      'password123',
    );
  });
});

describe('signOut', () => {
  it('firebaseSignOut を呼び出す', async () => {
    mockSignOut.mockResolvedValue(undefined);
    await signOut();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});

describe('linkEmailToAnonymous', () => {
  it('linkWithCredential を呼び出す', async () => {
    mockLinkWith.mockResolvedValue(dummyCredential as never);
    const mockUser = { uid: 'anon-1' };
    await linkEmailToAnonymous(mockUser as never, 'a@b.com', 'pass123');
    expect(mockLinkWith).toHaveBeenCalledTimes(1);
  });
});

describe('subscribeAuthState', () => {
  it('onAuthStateChanged を呼び出し、unsubscribe 関数を返す', () => {
    const unsubscribe = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribe as never);

    const cb = jest.fn();
    const unsub = subscribeAuthState(cb);

    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(expect.anything(), cb);
    unsub();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
