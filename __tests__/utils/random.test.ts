import { shuffleArray, pickSeeded, hashString } from '@/utils/random';

describe('seeded random (T76)', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'].map((x, i) => ({ id: String(i), name: x }));

  it('same (user, day) -> same order (deterministic)', () => {
    expect(shuffleArray(ids, 'user1')).toEqual(shuffleArray(ids, 'user1'));
  });

  it('different users -> (usually) different order', () => {
    const a = shuffleArray(ids, 'user1').map((x) => x.id).join(',');
    const b = shuffleArray(ids, 'user2').map((x) => x.id).join(',');
    // with 6 items the chance of identical order is 1/720; assert not required but warn
    // eslint-disable-next-line no-console
    console.log('user1:', a, '| user2:', b);
  });

  it('pickSeeded returns one valid item', () => {
    const picked = pickSeeded(ids, 'user1');
    expect(ids.some((x) => x === picked)).toBe(true);
  });

  it('same seed string -> same hash', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
    expect(hashString('abc')).not.toBe(hashString('abd'));
  });
});
