export type MealRole = 'organized' | 'participating';
export type RoleFilter = 'all' | MealRole;

export interface AgendaMeal {
  id: string;
  role: MealRole;
  mealType: string | null;
  date: string | null; // YYYY-MM-DD
  time: string | null;
  participants: number;
  name: string;
  location: string | null;
  image: string | null;
}

export interface AgendaGroup {
  key: string;
  label: string | null; // null = «Passadas» / «Por agendar» tratados pela UI
  kind: 'month' | 'undated' | 'past';
  meals: AgendaMeal[];
}

/** Normaliza a linha de /api/meals/scheduled (snake_case, `restaurants` do join). */
export function normalizeMeal(raw: any, userId: string | undefined): AgendaMeal {
  const r = raw?.restaurant ?? raw?.restaurants ?? null;
  const images = r?.images;
  const image = r?.image ?? (Array.isArray(images) && typeof images[0] === 'string' ? images[0] : null);
  const participants =
    typeof raw?.participant_count === 'number'
      ? raw.participant_count
      : Array.isArray(raw?.meal_participants)
        ? raw.meal_participants.length
        : 0;
  return {
    id: String(raw.id),
    role: userId && raw.organizer_id && raw.organizer_id !== userId ? 'participating' : 'organized',
    mealType: raw.meal_type ?? null,
    date: raw.meal_date ? String(raw.meal_date).slice(0, 10) : null,
    time: raw.meal_time ? String(raw.meal_time).slice(0, 5) : null,
    participants,
    name: r?.name || raw.restaurant_name || '',
    location: r?.location ?? null,
    image,
  };
}

const parse = (d: string) => new Date(`${d}T12:00:00`);

/** Dias entre `today` e `d` (negativo = passado). */
export function daysUntil(d: string, today: string): number {
  return Math.round((parse(d).getTime() - parse(today).getTime()) / 864e5);
}

export function filterByRole(meals: AgendaMeal[], role: RoleFilter): AgendaMeal[] {
  return role === 'all' ? meals : meals.filter((m) => m.role === role);
}

/** Próximas por mês (e «por agendar» no fim), depois passadas, mais recente primeiro. */
export function groupAgenda(meals: AgendaMeal[], today: string): AgendaGroup[] {
  const isPast = (m: AgendaMeal) => !!m.date && m.date < today;
  const up = meals
    .filter((m) => !isPast(m))
    .sort((a, b) => (a.date ?? '9').localeCompare(b.date ?? '9') || (a.time ?? '').localeCompare(b.time ?? ''));
  const past = meals.filter(isPast).sort((a, b) => (b.date as string).localeCompare(a.date as string));

  const groups: AgendaGroup[] = [];
  for (const m of up) {
    const key = m.date ? m.date.slice(0, 7) : 'undated';
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) {
      g = { key, label: m.date ? key : null, kind: m.date ? 'month' : 'undated', meals: [] };
      groups.push(g);
    }
    g.meals.push(m);
  }
  if (past.length) groups.push({ key: 'past', label: null, kind: 'past', meals: past });
  return groups;
}
