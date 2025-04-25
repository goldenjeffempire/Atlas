
import { google } from 'googleapis';
import { WebClient } from '@slack/web-api';
import axios from 'axios';

// Google Calendar Integration
export const calendar = google.calendar({ version: 'v3' });

// Slack Integration
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export const integrationService = {
  async syncGoogleCalendar(booking: any) {
    try {
      const event = {
        summary: `ATLAS Workspace: ${booking.workspace.name}`,
        location: booking.workspace.location,
        description: `Workspace booking at ${booking.workspace.name}`,
        start: { dateTime: booking.startTime },
        end: { dateTime: booking.endTime },
      };
      
      await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
    } catch (error) {
      console.error('Google Calendar sync failed:', error);
    }
  },

  async sendSlackNotification(userId: string, message: string) {
    try {
      await slack.chat.postMessage({
        channel: userId,
        text: message,
      });
    } catch (error) {
      console.error('Slack notification failed:', error);
    }
  },

  generateMeetingLink(platform: 'zoom' | 'meet' | 'teams') {
    // Integration with video platforms would go here
    return `https://${platform}.example.com/meeting-id`;
  },
};
