import { normalizeMeal, groupAgenda, filterByRole, daysUntil, AgendaMeal } from '@/libs/meals/agenda';

const m = (o: Partial<AgendaMeal>): AgendaMeal => ({
  id: 'x', role: 'organized', mealType: null, date: null, time: null,
  participants: 0, name: 'R', location: null, image: null, ...o,
});

describe('normalizeMeal', () => {
  it('usa o join `restaurants`, primeira imagem e papel por organizer_id', () => {
    const r = normalizeMeal(
      { id: 1, organizer_id: 'o', meal_date: '2026-12-01', meal_time: '13:00:00', meal_participants: [{}, {}],
        restaurants: { name: 'A', location: 'Porto', images: ['u.jpg'] } },
      'me'
    );
    expect(r).toMatchObject({ id: '1', role: 'participating', time: '13:00', participants: 2, name: 'A', image: 'u.jpg' });
  });
  it('fallbacks: sem restaurante, sem data, organizador = utilizador', () => {
    const r = normalizeMeal({ id: 2, organizer_id: 'me', restaurant_name: 'B' }, 'me');
    expect(r).toMatchObject({ role: 'organized', date: null, time: null, name: 'B', image: null, participants: 0 });
  });
});

describe('groupAgenda', () => {
  const today = '2026-11-27';
  const groups = groupAgenda(
    [
      m({ id: 'p1', date: '2026-11-14' }), m({ id: 'p2', date: '2026-10-30' }),
      m({ id: 'u2', date: '2026-12-01' }), m({ id: 'u1', date: '2026-11-28' }),
      m({ id: 'n' }), m({ id: 'hoje', date: today }),
    ],
    today
  );
  it('meses por ordem, sem data depois, passadas no fim (recentes primeiro)', () => {
    expect(groups.map((g) => g.key)).toEqual(['2026-11', '2026-12', 'undated', 'past']);
    expect(groups[0].meals.map((x) => x.id)).toEqual(['hoje', 'u1']);
    expect(groups[3].meals.map((x) => x.id)).toEqual(['p1', 'p2']);
  });
  it('lista vazia = sem grupos', () => expect(groupAgenda([], today)).toEqual([]));
});

describe('filtro e dias', () => {
  it('filtra por papel', () => {
    const l = [m({ id: 'a' }), m({ id: 'b', role: 'participating' })];
    expect(filterByRole(l, 'all')).toHaveLength(2);
    expect(filterByRole(l, 'participating').map((x) => x.id)).toEqual(['b']);
  });
  it('daysUntil', () => {
    expect(daysUntil('2026-11-28', '2026-11-27')).toBe(1);
    expect(daysUntil('2026-11-26', '2026-11-27')).toBe(-1);
  });
});
