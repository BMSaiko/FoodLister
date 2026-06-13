import { generateIcsContent, generateIcsBlob, generateMealIcsContent } from '@/libs/ics-generator';

describe('generateIcsContent', () => {
  const baseEvent = {
    title: 'Jantar no Pasta Place',
    description: 'Jantar com amigos',
    location: 'Rua das Flores, 123',
    startDate: new Date(Date.UTC(2026, 7, 9, 19, 0, 0)),
    endDate: new Date(Date.UTC(2026, 7, 9, 21, 0, 0)),
  };

  it('generates valid ICS content with required fields', () => {
    const result = generateIcsContent(baseEvent);
    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('VERSION:2.0');
    expect(result).toContain('BEGIN:VEVENT');
    expect(result).toContain('DTSTART:20260809T190000');
    expect(result).toContain('DTEND:20260809T210000');
    expect(result).toContain('SUMMARY:Jantar no Pasta Place');
    expect(result).toContain('END:VEVENT');
    expect(result).toContain('END:VCALENDAR');
  });

  it('escapes special characters', () => {
    const event = { ...baseEvent, title: 'Test with special chars' };
    const result = generateIcsContent(event);
    expect(result).toContain('SUMMARY:Test with special chars');
  });

  it('includes organizer when provided', () => {
    const event = { ...baseEvent, organizer: { name: 'Joao', email: 'joao@example.com' } };
    const result = generateIcsContent(event);
    expect(result).toContain('ORGANIZER');
    expect(result).toContain('mailto:joao@example.com');
  });

  it('includes attendees when provided', () => {
    const event = {
      ...baseEvent,
      attendees: [
        { name: 'Ana', email: 'ana@example.com' },
        { name: 'Carlos', email: 'carlos@example.com' },
      ],
    };
    const result = generateIcsContent(event);
    expect(result).toContain('ATTENDEE;ROLE=REQ-PARTICIPANT');
    expect(result).toContain('ATTENDEE;ROLE=OPT-PARTICIPANT');
  });

  it('includes alarm reminder', () => {
    const result = generateIcsContent(baseEvent);
    expect(result).toContain('BEGIN:VALARM');
    expect(result).toContain('TRIGGER:-PT1H');
    expect(result).toContain('END:VALARM');
  });

  it('uses custom UID when provided', () => {
    const event = { ...baseEvent, uid: 'custom-uid@test.com' };
    const result = generateIcsContent(event);
    expect(result).toContain('UID:custom-uid@test.com');
  });

  it('includes location', () => {
    const result = generateIcsContent(baseEvent);
    expect(result).toContain('LOCATION');
    expect(result).toContain('Rua das Flores');
  });
});

describe('generateIcsBlob', () => {
  it('returns a Blob with correct MIME type', () => {
    const event = {
      title: 'Test', description: 'Desc', location: 'Loc',
      startDate: new Date(), endDate: new Date(),
    };
    const blob = generateIcsBlob(event);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/calendar;charset=utf-8');
  });
});

describe('generateMealIcsContent', () => {
  it('generates ICS for a scheduled meal', () => {
    const result = generateMealIcsContent({
      restaurantName: 'Pasta Place', mealType: 'jantar',
      mealDate: '2026-08-09', mealTime: '19:00', durationMinutes: 120,
      organizerName: 'Joao', organizerEmail: 'joao@example.com',
    });
    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('Pasta Place');
  });

  it('handles different meal types', () => {
    const result = generateMealIcsContent({
      restaurantName: 'Cafe', mealType: 'almoco',
      mealDate: '2026-08-09', mealTime: '12:00', durationMinutes: 60,
      organizerName: 'Ana', organizerEmail: 'ana@example.com',
    });
    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('Cafe');
  });
});

