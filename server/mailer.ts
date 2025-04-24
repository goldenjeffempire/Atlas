// Simple email notification service
// For a production app, you would use a real email service like SendGrid, Mailgun, etc.

interface BookingConfirmationData {
  userName: string;
  workspaceName: string;
  workspaceLocation: string;
  startTime: string;
  endTime: string;
  bookingId: string;
}

export function sendBookingConfirmation(
  email: string,
  data: BookingConfirmationData
) {
  console.log(`[EMAIL SERVICE] Sending booking confirmation to ${email}`);
  console.log(`Subject: Your ATLAS Workspace Booking Confirmation`);
  console.log(`
    Hello ${data.userName},

    Your workspace booking has been confirmed!

    Details:
    - Workspace: ${data.workspaceName}
    - Location: ${data.workspaceLocation}
    - Start: ${data.startTime}
    - End: ${data.endTime}
    - Booking ID: ${data.bookingId}

    You can manage your booking from your ATLAS dashboard.

    Thank you for using ATLAS Workspace Booking.
  `);
  
  // In a real implementation, you would use a proper email service:
  // For example with Nodemailer:
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'noreply@atlasapp.com',
    to: email,
    subject: 'Your ATLAS Workspace Booking Confirmation',
    html: `<div>
      <h1>Your booking is confirmed!</h1>
      <p>Hello ${data.userName},</p>
      <p>Your workspace booking has been confirmed.</p>
      <div>
        <p><strong>Workspace:</strong> ${data.workspaceName}</p>
        <p><strong>Location:</strong> ${data.workspaceLocation}</p>
        <p><strong>Start Time:</strong> ${data.startTime}</p>
        <p><strong>End Time:</strong> ${data.endTime}</p>
        <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      </div>
      <p>You can manage your booking from your ATLAS dashboard.</p>
    </div>`
  };

  return transporter.sendMail(mailOptions);
  */
}
