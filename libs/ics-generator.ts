/**
 * ICS (iCalendar) Generator Utility
 * 
 * Generates .ics files compatible with:
 * - Google Calendar
 * - Outlook
 * - Apple Calendar
 * - Yahoo Calendar
 * - Any other iCalendar-compatible application
 */

export interface IcsEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizer?: {
    name: string;
    email: string;
  };
  attendees?: Array<{
    name: string;
    email: string;
  }>;
  uid?: string;
}

/**
 * Format a date to iCalendar format (YYYYMMDDTHHmmSS)
 */
function formatDateToIcs(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Escape special characters in iCalendar text
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a unique UID for the event
 */
function generateUid(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}@foodlister.com`;
}

/**
 * Generate ICS content string
 */
export function generateIcsContent(event: IcsEvent): string {
  const uid = event.uid || generateUid();
  const now = new Date();
  
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FoodLister//Meal Scheduling//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `DTSTART:${formatDateToIcs(event.startDate)}`,
    `DTEND:${formatDateToIcs(event.endDate)}`,
    `DTSTAMP:${formatDateToIcs(now)}`,
    `UID:${uid}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
  ];

  // Add organizer
  if (event.organizer) {
    lines.push(`ORGANIZER;CN=${escapeIcsText(event.organizer.name)}:mailto:${event.organizer.email}`);
  }

  // Add attendees
  if (event.attendees && event.attendees.length > 0) {
    event.attendees.forEach((attendee, index) => {
      const role = index === 0 ? 'REQ-PARTICIPANT' : 'OPT-PARTICIPANT';
      lines.push(`ATTENDEE;ROLE=${role};RSVP=TRUE;CN=${escapeIcsText(attendee.name)}:mailto:${attendee.email}`);
    });
  }

  // Add alarm (reminder 1 hour before)
  lines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Lembrete: ${escapeIcsText(event.title)}`,
    'END:VALARM'
  );

  lines.push(
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return lines.join('\r\n');
}

/**
 * Generate ICS file as a Blob
 */
export function generateIcsBlob(event: IcsEvent): Blob {
  const content = generateIcsContent(event);
  return new Blob([content], { type: 'text/calendar;charset=utf-8' });
}

/**
 * Download ICS file in the browser
 */
export function downloadIcsFile(event: IcsEvent, filename?: string): void {
  const blob = generateIcsBlob(event);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `refeição-${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate ICS content for a scheduled meal
 */
export function generateMealIcsContent(meal: {
  restaurantName: string;
  mealType: string;
  mealDate: string;
  mealTime: string;
  durationMinutes: number;
  organizerName: string;
  organizerEmail: string;
  location?: string;
  description?: string;
  attendees?: Array<{ name: string; email: string }>;
}): string {
  // Parse date and time
  const [year, month, day] = meal.mealDate.split('-').map(Number);
  const [hours, minutes] = meal.mealTime.split(':').map(Number);
  
  const startDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const endDate = new Date(startDate.getTime() + meal.durationMinutes * 60 * 1000);

  const mealTypeLabels: Record<string, string> = {
    'pequeno-almoco': 'Pequeno Almoço',
    'almoco': 'Almoço',
    'brunch': 'Brunch',
    'lanche': 'Lanche',
    'jantar': 'Jantar',
    'ceia': 'Ceia'
  };

  const mealLabel = mealTypeLabels[meal.mealType] || meal.mealType;

  return generateIcsContent({
    title: `${mealLabel} em ${meal.restaurantName}`,
    description: meal.description || `${mealLabel} reservado no restaurante ${meal.restaurantName}.`,
    location: meal.location || meal.restaurantName,
    startDate,
    endDate,
    organizer: {
      name: meal.organizerName,
      email: meal.organizerEmail
    },
    attendees: meal.attendees
  });
}