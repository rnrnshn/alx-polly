# Pollly - Modern Polling Application

A modern, responsive polling application built with Next.js 15, TypeScript, and Supabase. Create polls, share them with QR codes, and gather real-time feedback from your audience.

## 🚀 Features

- **🔐 User Authentication**: Complete sign up, sign in, and user management with Supabase Auth
- **📊 Poll Creation**: Create polls with multiple options, descriptions, and customizable settings
- **🗳️ Poll Voting**: Vote on polls with real-time results and anonymous voting support
- **📱 Dashboard**: View your created polls, statistics, and manage your content
- **🌐 Browse Polls**: Discover and participate in public polls from the community
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔗 QR Code Sharing**: Share polls via unique links and QR codes
- **⚡ Real-time Updates**: Live poll results and instant feedback

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Server Components + Client Components
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Jest with React Testing Library

## 📁 Project Structure

```
alx-polly/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication route group
│   │   ├── login/page.tsx        # Login page
│   │   └── register/page.tsx     # Registration page
│   ├── (dashboard)/              # Dashboard route group
│   │   └── dashboard/page.tsx    # User dashboard
│   ├── polls/                    # Polls routes
│   │   ├── [id]/                 # Dynamic poll pages
│   │   │   ├── page.tsx          # Poll view page
│   │   │   └── edit/page.tsx     # Poll edit page
│   │   ├── create/page.tsx       # Create new poll
│   │   └── page.tsx              # Browse polls
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
│   │   ├── PollDetail.tsx        # Poll detail view
│   │   ├── CreatePollForm.tsx    # Poll creation form
│   │   ├── EditPollForm.tsx      # Poll editing form
│   │   └── DashboardPollCard.tsx # Dashboard poll card
│   └── ui/                       # Shadcn UI components
├── lib/                          # Utility libraries
│   ├── actions/                  # Server actions
│   │   ├── auth.ts               # Authentication actions
│   │   └── polls.ts              # Poll management actions
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Authentication hook
│   │   └── withAuth.tsx          # Auth HOC
│   ├── supabase/                 # Supabase configuration
│   │   ├── client.ts             # Client-side Supabase
│   │   ├── server.ts             # Server-side Supabase
│   │   └── middleware.ts         # Auth middleware
│   ├── types/                    # TypeScript type definitions
│   │   ├── database.ts           # Database types
│   │   └── index.ts              # App types
│   └── utils.ts                  # Utility functions
├── supabase/                     # Database schema and migrations
│   ├── schema.sql                # Database schema
│   └── sample-data.sql           # Sample data
├── __tests__/                    # Test files
└── public/                       # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd alx-polly
npm install
```

### 2. Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Get Your Credentials**:
   - Go to Project Settings → API
   - Copy your Project URL and anon/public key

3. **Set Up Environment Variables**:
   Create a `.env.local` file in your project root:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 3. Database Setup

1. **Apply Database Schema**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the script

2. **Verify Setup** (Optional):
   - Check that tables are created: `profiles`, `polls`, `poll_options`, `votes`
   - Verify RLS policies are enabled
   - Test the `handle_new_user` trigger

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 📖 Usage Examples

### Creating a Poll

1. **Sign up/Login** to your account
2. **Navigate** to "Create Poll" from the dashboard or header
3. **Fill out the form**:
   - Poll title (required)
   - Description (optional)
   - Add poll options (minimum 2, maximum 10)
   - Configure settings:
     - Make poll public/private
     - Allow multiple votes per user
4. **Submit** the form to create your poll

```typescript
// Example poll creation data
const pollData = {
  title: "What's your favorite programming language?",
  description: "Help us choose our next tech stack",
  options: ["JavaScript", "Python", "TypeScript", "Rust"],
  is_public: true,
  allow_multiple_votes: false
};
```

### Voting on Polls

1. **Browse** public polls from the main polls page
2. **Click** on a poll to view details
3. **Select** your preferred option(s)
4. **Submit** your vote
5. **View** real-time results

**Anonymous Voting**: Users can vote without an account by providing their name and email.

**Multiple Votes**: If enabled by the poll creator, users can vote on multiple options.

### Managing Your Polls

From your dashboard, you can:
- **View** all your created polls
- **Edit** poll details and options
- **Share** polls via direct links
- **Delete** polls you no longer need
- **Monitor** poll statistics and activity

## 🧪 Testing

The application includes comprehensive testing setup:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Structure

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Authentication and poll management flows
- **Coverage Reports**: Detailed coverage analysis

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Yes |

## 🗄️ Database Schema

The application uses the following main tables:

- **`profiles`**: User profile information
- **`polls`**: Poll metadata and settings
- **`poll_options`**: Individual poll options
- **`votes`**: User votes and anonymous voting data
- **`poll_shares`**: QR codes and sharing links

## 🔐 Authentication Flow

1. **Registration**: Users sign up with email/password
2. **Email Verification**: Supabase sends verification email
3. **Login**: Users authenticate with verified credentials
4. **Session Management**: Automatic session handling with middleware
5. **Profile Creation**: Automatic profile creation via database triggers

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Components**: Built with Shadcn UI for consistent design
- **Loading States**: Proper loading indicators throughout the app
- **Error Handling**: User-friendly error messages and validation
- **Accessibility**: ARIA labels and keyboard navigation support

## 🚨 Troubleshooting

### Common Issues

**Database Connection Issues**:
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure the database schema has been applied

**Authentication Issues**:
- Make sure RLS policies are enabled
- Check that the `handle_new_user` trigger is working
- Verify user profiles are being created

**Poll Creation Issues**:
- Ensure you're logged in
- Check that all required fields are filled
- Verify the poll options are unique

**Voting Issues**:
- Check if the poll is still active
- Verify poll expiration dates
- Ensure voting permissions are correct

## 🛣️ Roadmap

- [ ] **QR Code Generation**: Automatic QR code creation for polls
- [ ] **Real-time Updates**: WebSocket support for live results
- [ ] **Poll Analytics**: Detailed voting statistics and insights
- [ ] **Poll Categories**: Organize polls by topics
- [ ] **Advanced Sharing**: Social media integration
- [ ] **Export Results**: Download poll results as CSV/PDF
- [ ] **Poll Templates**: Pre-built poll templates
- [ ] **Multi-language Support**: Internationalization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Use conventional commits for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend-as-a-service platform
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

**Happy Polling! 🗳️**