-- Sample Data Insertion Script
-- Run this after you have created your first user account

-- First, get your user ID (replace 'your-email@example.com' with your actual email)
-- SELECT id FROM public.profiles WHERE email = 'your-email@example.com';

-- Insert sample polls (replace 'your-user-id' with your actual user ID from the query above)
INSERT INTO public.polls (title, description, is_public, allow_multiple_votes, created_by) VALUES
('What''s your favorite programming language?', 'Let''s see what the community prefers', true, false, 'your-user-id'),
('Best pizza topping?', 'The age-old debate continues', true, true, 'your-user-id'),
('Which framework do you prefer for web development?', 'Share your thoughts on modern web frameworks', true, false, 'your-user-id')
ON CONFLICT DO NOTHING;

-- Insert sample options for the first poll (programming languages)
INSERT INTO public.poll_options (poll_id, text, order_index) 
SELECT 
    p.id,
    option_text,
    row_number() OVER (ORDER BY option_text)
FROM public.polls p
CROSS JOIN (VALUES 
    ('JavaScript'),
    ('Python'),
    ('TypeScript'),
    ('Rust')
) AS options(option_text)
WHERE p.title = 'What''s your favorite programming language?'
ON CONFLICT DO NOTHING;

-- Insert sample options for the second poll (pizza toppings)
INSERT INTO public.poll_options (poll_id, text, order_index) 
SELECT 
    p.id,
    option_text,
    row_number() OVER (ORDER BY option_text)
FROM public.polls p
CROSS JOIN (VALUES 
    ('Pepperoni'),
    ('Mushrooms'),
    ('Pineapple'),
    ('Sausage'),
    ('Extra Cheese')
) AS options(option_text)
WHERE p.title = 'Best pizza topping?'
ON CONFLICT DO NOTHING;

-- Insert sample options for the third poll (web frameworks)
INSERT INTO public.poll_options (poll_id, text, order_index) 
SELECT 
    p.id,
    option_text,
    row_number() OVER (ORDER BY option_text)
FROM public.polls p
CROSS JOIN (VALUES 
    ('React'),
    ('Vue'),
    ('Angular'),
    ('Svelte'),
    ('Next.js')
) AS options(option_text)
WHERE p.title = 'Which framework do you prefer for web development?'
ON CONFLICT DO NOTHING;

-- Insert some sample votes (optional - for testing)
-- Replace 'poll-id' and 'option-id' with actual IDs from your polls and options
/*
INSERT INTO public.votes (poll_id, option_id, voter_email, voter_name) VALUES
('poll-id', 'option-id', 'anonymous@example.com', 'Anonymous User 1'),
('poll-id', 'option-id', 'anonymous@example.com', 'Anonymous User 2');
*/

-- Create a share code for the first poll (optional)
INSERT INTO public.poll_shares (poll_id, share_code, created_by)
SELECT 
    p.id,
    'poll_' || substr(md5(random()::text), 1, 8),
    p.created_by
FROM public.polls p
WHERE p.title = 'What''s your favorite programming language?'
LIMIT 1
ON CONFLICT DO NOTHING;
