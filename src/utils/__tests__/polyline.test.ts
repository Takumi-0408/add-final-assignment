import { decodePolyline, encodePolyline } from '../polyline';

describe('decodePolyline', () => {
  it('空文字のとき空配列を返す', () => {
    expect(decodePolyline('')).toEqual([]);
  });

  it('Google Encoded Polyline を正しくデコードする', () => {
    // "_p~iF~ps|U" → [{lat: 38.5, lng: -120.2}] (Google の公式例)
    const result = decodePolyline('_p~iF~ps|U');
    expect(result).toHaveLength(1);
    expect(result[0]!.latitude).toBeCloseTo(38.5, 1);
    expect(result[0]!.longitude).toBeCloseTo(-120.2, 1);
  });

  it('複数点のポリラインをデコードする', () => {
    // "_p~iF~ps|U_ulLnnqC_mqNvxq`@" → 3点 (Google の例)
    const result = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
    expect(result).toHaveLength(3);
  });
});

describe('encodePolyline', () => {
  it('空配列のとき空文字を返す', () => {
    expect(encodePolyline([])).toBe('');
  });

  it('エンコード→デコードで元の座標に戻る', () => {
    const points = [
      { latitude: 35.6812, longitude: 139.7671 },
      { latitude: 35.658, longitude: 139.7016 },
    ];
    const encoded = encodePolyline(points);
    const decoded = decodePolyline(encoded);
    expect(decoded).toHaveLength(2);
    expect(decoded[0]!.latitude).toBeCloseTo(points[0]!.latitude, 4);
    expect(decoded[0]!.longitude).toBeCloseTo(points[0]!.longitude, 4);
  });
});
