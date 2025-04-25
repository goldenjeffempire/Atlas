
import nodemailer from 'nodemailer';
import { addMinutes } from 'date-fns';

// Email templates
const templates = {
  bookingConfirmation: (data: BookingConfirmationData) => `
    <h1>Your ATLAS Workspace Booking Confirmation</h1>
    <p>Hello ${data.userName},</p>
    <p>Your workspace booking has been confirmed!</p>
    <div style="margin: 20px 0;">
      <p><strong>Workspace:</strong> ${data.workspaceName}</p>
      <p><strong>Location:</strong> ${data.workspaceLocation}</p>
      <p><strong>Start:</strong> ${data.startTime}</p>
      <p><strong>End:</strong> ${data.endTime}</p>
      <p><strong>Booking ID:</strong> ${data.bookingId}</p>
    </div>
    <p>You can manage your booking from your ATLAS dashboard.</p>
  `,
  
  bookingReminder: (data: BookingConfirmationData) => `
    <h1>Upcoming Workspace Booking Reminder</h1>
    <p>Hello ${data.userName},</p>
    <p>This is a reminder about your upcoming workspace booking:</p>
    <div style="margin: 20px 0;">
      <p><strong>Workspace:</strong> ${data.workspaceName}</p>
      <p><strong>Location:</strong> ${data.workspaceLocation}</p>
      <p><strong>Start:</strong> ${data.startTime}</p>
      <p><strong>End:</strong> ${data.endTime}</p>
    </div>
    <p>We look forward to seeing you!</p>
  `
};

interface BookingConfirmationData {
  userName: string;
  workspaceName: string;
  workspaceLocation: string;
  startTime: string;
  endTime: string;
  bookingId: string;
}

// For development, log emails instead of sending
const isDev = process.env.NODE_ENV === 'development';

const transporter = isDev ? null : nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (isDev) {
    console.log(`[EMAIL SERVICE] To: ${to}\nSubject: ${subject}\nBody:\n${html}`);
    return;
  }

  return transporter?.sendMail({
    from: process.env.SMTP_FROM || 'noreply@atlas-app.com',
    to,
    subject,
    html
  });
}

export async function sendBookingConfirmation(email: string, data: BookingConfirmationData) {
  await sendEmail(
    email,
    'Your ATLAS Workspace Booking Confirmation',
    templates.bookingConfirmation(data)
  );

  // Schedule reminder for 24h before booking
  const startTime = new Date(data.startTime);
  const reminderTime = addMinutes(startTime, -24 * 60);
  
  if (reminderTime > new Date()) {
    setTimeout(async () => {
      await sendEmail(
        email,
        'Reminder: Upcoming Workspace Booking',
        templates.bookingReminder(data)
      );
    }, reminderTime.getTime() - Date.now());
  }
}
