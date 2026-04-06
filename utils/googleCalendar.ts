/**
 * Google Calendar URL generation utilities
 * 
 * This module provides pure functions for generating Google Calendar event URLs
 * with pre-filled event details.
 */

export interface CalendarEventDetails {
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location: string;
  attendees?: string[];
}

/**
 * Formats a Date object to Google Calendar's expected format (YYYYMMDDTHHmmSS)
 * Note: This uses local time, not UTC, to preserve the user's intended time
 */
export function formatCalendarDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Generates a Google Calendar event URL with pre-filled details
 * 
 * @param eventDetails - The event details to include in the URL
 * @returns The full Google Calendar URL
 */
export function generateGoogleCalendarUrl(eventDetails: CalendarEventDetails): string {
  const baseUrl = 'https://calendar.google.com/calendar/u/0/r/eventedit';
  
  const startFormatted = formatCalendarDateTime(eventDetails.startDate);
  const endFormatted = formatCalendarDateTime(eventDetails.endDate);
  
  const params = new URLSearchParams({
    text: eventDetails.title,
    dates: `${startFormatted}/${endFormatted}`,
    details: eventDetails.description,
    location: eventDetails.location,
  });

  if (eventDetails.attendees && eventDetails.attendees.length > 0) {
    params.set('add', eventDetails.attendees.join(','));
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Opens a Google Calendar event URL in a new window
 * 
 * @param url - The Google Calendar URL to open
 * @returns The window reference or null if blocked
 */
export function openGoogleCalendarEvent(url: string): Window | null {
  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      return null;
    }
    
    return newWindow;
  } catch {
    return null;
  }
}