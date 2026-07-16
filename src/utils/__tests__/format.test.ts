import { formatDistance, formatDuration } from '../format';

describe('formatDistance', () => {
  it('1000m 未満はメートル表示', () => {
    expect(formatDistance(500)).toBe('500m');
  });

  it('1000m 以上はキロメートル表示（小数1桁）', () => {
    expect(formatDistance(1500)).toBe('1.5km');
    expect(formatDistance(2000)).toBe('2.0km');
    expect(formatDistance(12345)).toBe('12.3km');
  });

  it('0m のとき "0m"', () => {
    expect(formatDistance(0)).toBe('0m');
  });
});

describe('formatDuration', () => {
  it('60秒未満は "1分未満"', () => {
    expect(formatDuration(30)).toBe('1分未満');
  });

  it('60秒は "1分"', () => {
    expect(formatDuration(60)).toBe('1分');
  });

  it('60分未満は "X分"', () => {
    expect(formatDuration(1800)).toBe('30分');
  });

  it('60分以上は "X時間Y分"', () => {
    expect(formatDuration(3660)).toBe('1時間1分');
    expect(formatDuration(7200)).toBe('2時間0分');
  });
});
