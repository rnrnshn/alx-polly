# Pollly - Modern Polling Application

A modern, responsive polling application built with Next.js 15, TypeScript, and Shadcn UI components.

## Features

- **User Authentication**: Sign up, sign in, and user management
- **Poll Creation**: Create polls with multiple options, descriptions, and settings
- **Poll Voting**: Vote on polls with real-time results
- **Dashboard**: View your created polls and statistics
- **Browse Polls**: Discover and participate in public polls
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Context API
- **Authentication**: Custom auth system (ready for backend integration)

## Project Structure

```
alx-polly/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication route group
│   │   ├── login/page.tsx        # Login page
│   │   └── register/page.tsx     # Registration page
│   ├── (dashboard)/              # Dashboard route group
│   │   └── dashboard/page.tsx    # User dashboard
│   ├── polls/                    # Polls routes
│   │   ├── page.tsx              # Browse polls
│   │   └── create/page.tsx       # Create new poll
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   │   ├── LoginForm.tsx         # Login form
│   │   └── RegisterForm.tsx      # Registration form
│   ├── layout/                   # Layout components
│   │   └── Header.tsx            # Navigation header
│   ├── polls/                    # Poll-related components
│   │   ├── PollCard.tsx          # Poll display card
│   │   └── CreatePollForm.tsx    # Poll creation form
│   └── ui/                       # Shadcn UI components
├── lib/                          # Utility libraries
│   ├── hooks/                    # Custom React hooks
│   │   └── useAuth.ts            # Authentication hook
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # App types
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
└── package.json                  # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alx-polly
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Components

### Authentication System

The app includes a complete authentication system with:
- User registration and login forms
- Authentication context for state management
- Protected routes and components
- User profile management

### Poll Management

- **Create Polls**: Form with validation for creating new polls
- **Poll Cards**: Reusable component for displaying poll information
- **Voting System**: Interface for voting on polls (ready for backend integration)
- **Results Display**: Visual representation of poll results

### UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Components**: Built with Shadcn UI for consistent design
- **Loading States**: Proper loading indicators throughout the app
- **Error Handling**: User-friendly error messages and validation

## Type Definitions

The app uses TypeScript with comprehensive type definitions:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  isActive: boolean;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

This is a scaffolded application ready for backend integration. Key areas for development:

1. **Backend API**: Implement authentication and poll management APIs
2. **Database**: Set up database schema and connections
3. **Real-time Updates**: Add WebSocket support for live poll results
4. **Advanced Features**: Poll sharing, analytics, user profiles
5. **Testing**: Add unit and integration tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
