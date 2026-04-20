import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

/**
 * Google Calendar Integration Library
 */

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export function getGoogleAuthClient(config: GoogleCalendarConfig) {
  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
  );

  oauth2Client.setCredentials({
    refresh_token: config.refreshToken,
  });

  return oauth2Client;
}

export async function createCalendarEvent(config: GoogleCalendarConfig, eventData: {
  title: string;
  startTime: string; // ISO string
  durationMinutes: number;
  description?: string;
  attendeeEmail?: string;
}) {
  try {
    const auth = getGoogleAuthClient(config);
    const calendar = google.calendar({ version: "v3", auth });

    const start = new Date(eventData.startTime);
    const end = new Date(start.getTime() + eventData.durationMinutes * 60000);

    const event = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: start.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "UTC",
      },
      attendees: eventData.attendeeEmail ? [{ email: eventData.attendeeEmail }] : [],
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return {
      success: true,
      eventId: response.data.id,
      link: response.data.htmlLink
    };
  } catch (error) {
    console.error("[GoogleCalendar] Failed to create event:", error);
    return { success: false, error: "Failed to create calendar event." };
  }
}

export async function getCalendarAvailability(config: GoogleCalendarConfig, timeMin: string, timeMax: string) {
  try {
    const auth = getGoogleAuthClient(config);
    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin,
        timeMax: timeMax,
        items: [{ id: "primary" }],
      },
    });

    return response.data.calendars?.primary?.busy || [];
  } catch (error) {
    console.error("[GoogleCalendar] Failed to query availability:", error);
    return [];
  }
}
