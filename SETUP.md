# Pollly App Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and API keys from the project settings
3. Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 3: Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Execute the script

## Step 4: Add Sample Data (Optional)

After creating your first user account:

1. Find your user ID:
   ```sql
   SELECT id FROM public.profiles WHERE email = 'your-email@example.com';
   ```

2. Update `supabase/sample-data.sql` with your user ID
3. Run the sample data script in the SQL Editor

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Features Now Available

✅ **User Registration & Login** - Complete authentication system
✅ **Create Polls** - Form to create new polls with multiple options
✅ **Browse Polls** - View all public polls
✅ **Dashboard** - See your created polls
✅ **Database Integration** - Real Supabase backend

## Next Steps

- Add voting functionality
- Implement QR code sharing
- Add poll results visualization
- Create individual poll pages

## Troubleshooting

### Database Connection Issues
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure the database schema has been applied

### Authentication Issues
- Make sure RLS policies are enabled
- Check that the `handle_new_user` trigger is working
- Verify user profiles are being created

### Poll Creation Issues
- Ensure you're logged in
- Check that all required fields are filled
- Verify the poll options are unique

