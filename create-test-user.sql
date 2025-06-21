-- Create test user in auth.users table for local Supabase
-- This script creates a properly authenticated user with all required fields

-- Generate a UUID for the test user
-- In a real environment, you would use gen_random_uuid() or a proper UUID generator

BEGIN;

-- Insert test user into auth.users table
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    aud,
    role,
    is_super_admin,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmed_at,
    email_change_sent_at,
    recovery_sent_at,
    invited_at,
    action_link,
    email_change_confirm_status,
    banned_until,
    deleted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid, -- Fixed UUID for demo user
    '00000000-0000-0000-0000-000000000000'::uuid, -- Default instance_id
    'demo@example.com',
    '$2a$10$DummyHashForTestingPurposesOnly123456789', -- Dummy bcrypt hash
    NOW(),
    NOW(),
    NOW(),
    '', -- Empty confirmation token since email is confirmed
    '',
    '',
    '',
    'authenticated',
    'authenticated',
    false,
    '{"provider":"email","providers":["email"]}',
    '{"email":"demo@example.com"}',
    NOW(),
    NULL,
    NULL,
    NULL,
    '',
    0,
    NULL,
    NULL
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW(),
    email_confirmed_at = NOW(),
    confirmed_at = NOW();

-- Check if the user was created successfully
SELECT 
    id,
    email,
    created_at,
    updated_at,
    email_confirmed_at,
    role,
    aud
FROM auth.users 
WHERE email = 'demo@example.com';

-- Check if any profile was automatically created via trigger
-- This depends on your specific database schema and triggers
SELECT * FROM public.profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid;

COMMIT;

-- Alternative: If you have RLS policies that require a profile, you might need to create one manually
-- Uncomment the following if needed:

/*
INSERT INTO public.profiles (
    id,
    email,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'demo@example.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
*/