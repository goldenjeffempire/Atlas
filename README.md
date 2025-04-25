
# ATLAS Workspace Booking App

ATLAS is a modern, enterprise-ready workspace booking platform designed for efficient management of office spaces, meeting rooms, and collaborative areas.

## Features

- **Role-Based Access Control**
  - Admin: Full system management
  - Employee: Workspace booking and management
  - General User: Basic booking capabilities
  - Learner: Access to learning-specific spaces

- **Workspace Management**
  - Real-time availability tracking
  - Multiple workspace types (desks, meeting rooms, private offices)
  - Feature-based filtering (monitors, projectors, whiteboards)
  - Location-based organization

- **Booking System**
  - Instant booking confirmation
  - Calendar integration
  - Email notifications
  - Booking modification and cancellation
  - Real-time availability updates

- **Smart Features**
  - AI-powered chat assistance
  - Workspace recommendations
  - Usage analytics
  - Interactive booking calendar

- **User Experience**
  - Modern, responsive design
  - Framer Motion animations
  - Real-time notifications
  - Mobile-optimized interface

## Tech Stack

- **Frontend**
  - React with TypeScript
  - Tailwind CSS
  - Shadcn UI Components
  - Framer Motion
  - Tanstack Query

- **Backend**
  - Node.js/Express
  - PostgreSQL with Drizzle ORM
  - Passport.js Authentication
  - JWT with HttpOnly Cookies

## Getting Started

1. Clone the repository in Replit
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in Replit Secrets:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `OPENAI_API_KEY` (optional for AI features)

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── client/           # Frontend React application
├── server/           # Backend Express server
├── shared/           # Shared types and schemas
├── migrations/       # Database migrations
└── scripts/         # Utility scripts
```

## Features in Detail

### Authentication
- Secure JWT-based authentication
- Role-based authorization
- Protected routes and API endpoints

### Workspace Management
- Create and manage workspace types
- Set capacity and features
- Track availability and usage

### Booking System
- Real-time availability checks
- Instant confirmations
- Email notifications
- Calendar integration

### Admin Dashboard
- Usage analytics
- User management
- Workspace configuration
- System monitoring

## Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.
