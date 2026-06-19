import { DEFAULT_MEAL_TYPES } from '@/hooks/forms/useMealScheduling';

describe('DEFAULT_MEAL_TYPES', () => {
  it('has 6 meal types', () => {
    expect(DEFAULT_MEAL_TYPES).toHaveLength(6);
  });

  it('includes jantar', () => {
    const jantar = DEFAULT_MEAL_TYPES.find(m => m.value === 'jantar');
    expect(jantar).toBeDefined();
    expect(jantar!.label).toBe('Jantar');
    expect(jantar!.defaultTime).toBe('19:00');
    expect(jantar!.defaultDuration).toBe(2);
  });

  it('includes almoco', () => {
    const almoco = DEFAULT_MEAL_TYPES.find(m => m.value === 'almoco');
    expect(almoco).toBeDefined();
    expect(almoco!.defaultTime).toBe('12:30');
  });

  it('includes pequeno-almoco', () => {
    const pa = DEFAULT_MEAL_TYPES.find(m => m.value === 'pequeno-almoco');
    expect(pa).toBeDefined();
  });

  it('each type has required fields', () => {
    DEFAULT_MEAL_TYPES.forEach(type => {
      expect(type.value).toBeTruthy();
      expect(type.label).toBeTruthy();
      expect(type.icon).toBeTruthy();
      expect(type.defaultTime).toMatch(/^\d{2}:\d{2}$/);
      expect(type.defaultDuration).toBeGreaterThan(0);
    });
  });
});

