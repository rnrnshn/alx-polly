# Supabase Database Setup

This directory contains the database schema and setup instructions for the Pollly polling application.

## Database Schema Overview

The schema includes the following tables:

### Core Tables
- **`profiles`** - User profiles (extends Supabase auth.users)
- **`polls`** - Poll information and settings
- **`poll_options`** - Individual poll options
- **`votes`** - User votes on poll options
- **`poll_shares`** - QR codes and sharing functionality

### Key Features
- **Row Level Security (RLS)** - Secure data access policies
- **Automatic timestamps** - Created/updated timestamps
- **Custom functions** - Poll results, vote validation, share code generation
- **Indexes** - Optimized for performance
- **Foreign key constraints** - Data integrity

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the script

### 4. Add Sample Data (Optional)

After creating your first user account:

1. Find your user ID:
   ```sql
   SELECT id FROM public.profiles WHERE email = 'your-email@example.com';
   ```

2. Update `sample-data.sql` with your user ID
3. Run the sample data script in the SQL Editor

### 5. Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Database Functions

### `get_poll_results(poll_uuid)`
Returns poll results with vote counts and percentages.

### `can_user_vote(poll_uuid, user_uuid)`
Checks if a user can vote on a specific poll.

### `generate_share_code()`
Generates unique share codes for polls.

## Security Policies

The schema includes comprehensive Row Level Security (RLS) policies:

- **Profiles**: Users can only access their own profile
- **Polls**: Public polls are viewable by everyone, private polls by owners
- **Votes**: Anyone can vote on public polls, owners can vote on their own polls
- **Options**: Viewable based on poll visibility
- **Shares**: Active share codes are publicly viewable

## Sample Data

The schema includes sample data for testing:
- Sample polls with different settings
- Poll options for demonstration
- Ready for immediate testing

## TypeScript Integration

The `lib/types/database.ts` file contains TypeScript types that match the database schema exactly. These are generated from the Supabase schema and provide full type safety.

## Usage Examples

### Creating a Poll
```typescript
const { data, error } = await supabase
  .from('polls')
  .insert({
    title: 'What\'s your favorite color?',
    description: 'Choose your preferred color',
    is_public: true,
    allow_multiple_votes: false,
    created_by: user.id
  })
```

### Getting Poll Results
```typescript
const { data, error } = await supabase
  .rpc('get_poll_results', { poll_uuid: pollId })
```

### Checking Vote Eligibility
```typescript
const { data, error } = await supabase
  .rpc('can_user_vote', { poll_uuid: pollId, user_uuid: userId })
```

## Migration Notes

When updating the schema:
1. Test changes in a development environment first
2. Backup production data before applying changes
3. Update TypeScript types if schema changes
4. Test all RLS policies after changes

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Ensure user is authenticated and policies are correctly configured
2. **Foreign Key Violations**: Check that referenced records exist
3. **Permission Denied**: Verify RLS policies allow the operation

### Debug Queries

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'polls';

-- View table structure
\d polls

-- Check function definitions
\df get_poll_results
```
