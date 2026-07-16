// expo の winter/runtime が要求するネイティブモジュールをモック
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
jest.mock('react-native/Libraries/NativeModules/specs/NativeSourceCode', () => ({
  __esModule: true,
  default: {
    getConstants: () => ({
      scriptURL: 'file:///mock',
    }),
  },
}));
