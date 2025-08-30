-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE poll_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE vote_type AS ENUM ('single', 'multiple');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls table
CREATE TABLE public.polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status poll_status DEFAULT 'active',
    is_public BOOLEAN DEFAULT true,
    allow_multiple_votes BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll options table
CREATE TABLE public.poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    voter_email TEXT, -- For anonymous voting
    voter_name TEXT, -- For anonymous voting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, option_id, voter_id, voter_email) -- Prevent duplicate votes
);

-- Poll shares table (for QR codes and sharing)
CREATE TABLE public.poll_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    share_code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_polls_created_by ON public.polls(created_by);
CREATE INDEX idx_polls_status ON public.polls(status);
CREATE INDEX idx_polls_public ON public.polls(is_public) WHERE is_public = true;
CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX idx_votes_option_id ON public.votes(option_id);
CREATE INDEX idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX idx_poll_shares_poll_id ON public.poll_shares(poll_id);
CREATE INDEX idx_poll_shares_code ON public.poll_shares(share_code);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_poll_options_updated_at BEFORE UPDATE ON public.poll_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to generate share codes
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'poll_' || substr(md5(random()::text), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Function to get poll results with vote counts
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid UUID)
RETURNS TABLE (
    option_id UUID,
    option_text TEXT,
    vote_count BIGINT,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.id as option_id,
        po.text as option_text,
        COUNT(v.id) as vote_count,
        CASE 
            WHEN (SELECT COUNT(*) FROM public.votes WHERE poll_id = poll_uuid) > 0 
            THEN ROUND((COUNT(v.id)::NUMERIC / (SELECT COUNT(*) FROM public.votes WHERE poll_id = poll_uuid)::NUMERIC) * 100, 2)
            ELSE 0 
        END as percentage
    FROM public.poll_options po
    LEFT JOIN public.votes v ON po.id = v.option_id
    WHERE po.poll_id = poll_uuid
    GROUP BY po.id, po.text
    ORDER BY po.order_index, po.created_at;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_shares ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Polls policies
CREATE POLICY "Anyone can view public polls" ON public.polls
    FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create polls" ON public.polls
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own polls" ON public.polls
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own polls" ON public.polls
    FOR DELETE USING (auth.uid() = created_by);

-- Poll options policies
CREATE POLICY "Anyone can view poll options for public polls" ON public.poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE id = poll_id 
            AND (is_public = true OR auth.uid() = created_by)
        )
    );

CREATE POLICY "Users can manage options for their own polls" ON public.poll_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE id = poll_id 
            AND auth.uid() = created_by
        )
    );

-- Votes policies
CREATE POLICY "Anyone can view votes for public polls" ON public.votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE id = poll_id 
            AND (is_public = true OR auth.uid() = created_by)
        )
    );

CREATE POLICY "Anyone can vote on public polls" ON public.votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE id = poll_id 
            AND is_public = true
            AND status = 'active'
            AND (expires_at IS NULL OR expires_at > NOW())
        )
    );

CREATE POLICY "Users can vote on their own polls" ON public.votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE id = poll_id 
            AND auth.uid() = created_by
        )
    );

-- Poll shares policies
CREATE POLICY "Anyone can view active share codes" ON public.poll_shares
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can create share codes for their polls" ON public.poll_shares
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE id = poll_id 
            AND auth.uid() = created_by
        )
    );

CREATE POLICY "Users can manage share codes for their polls" ON public.poll_shares
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE id = poll_id 
            AND auth.uid() = created_by
        )
    );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user can vote (for multiple vote restrictions)
CREATE OR REPLACE FUNCTION can_user_vote(poll_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    poll_record RECORD;
    existing_votes_count INTEGER;
BEGIN
    -- Get poll details
    SELECT * INTO poll_record FROM public.polls WHERE id = poll_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if poll is active and not expired
    IF poll_record.status != 'active' OR (poll_record.expires_at IS NOT NULL AND poll_record.expires_at <= NOW()) THEN
        RETURN FALSE;
    END IF;
    
    -- Count existing votes by this user
    SELECT COUNT(*) INTO existing_votes_count 
    FROM public.votes 
    WHERE poll_id = poll_uuid AND voter_id = user_uuid;
    
    -- If multiple votes not allowed and user already voted, return false
    IF NOT poll_record.allow_multiple_votes AND existing_votes_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Sample data will be inserted after user registration
-- You can run the following queries manually after creating your first user:

/*
-- Insert sample polls (replace 'your-user-id' with actual user ID)
INSERT INTO public.polls (title, description, is_public, allow_multiple_votes, created_by) VALUES
('What''s your favorite programming language?', 'Let''s see what the community prefers', true, false, 'your-user-id'),
('Best pizza topping?', 'The age-old debate continues', true, true, 'your-user-id'),
('Which framework do you prefer for web development?', 'Share your thoughts on modern web frameworks', true, false, 'your-user-id');

-- Insert sample options for the first poll (replace 'poll-id' with actual poll ID)
INSERT INTO public.poll_options (poll_id, text, order_index) VALUES
('poll-id', 'JavaScript', 1),
('poll-id', 'Python', 2),
('poll-id', 'TypeScript', 3),
('poll-id', 'Rust', 4);
*/
