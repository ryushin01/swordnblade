import { fitWithin } from './resize-image';

describe('fitWithin', () => {
  it('긴 변을 max에 맞추고 비율을 지킨다', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(1000, 3000, 1600)).toEqual({ width: 533, height: 1600 });
  });

  it('이미 작은 사진은 키우지 않는다', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});
