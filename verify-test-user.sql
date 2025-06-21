-- Verification queries for the test user creation

-- 1. Check if the user exists in auth.users
SELECT 
    'auth.users' as table_name,
    id,
    email,
    role,
    aud,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'demo@example.com';

-- 2. Check if profile was created (adjust table name if different)
SELECT 
    'public.profiles' as table_name,
    id,
    email,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid;

-- 3. Check if there are any triggers that might have been activated
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('users', 'profiles')
ORDER BY event_object_table, trigger_name;

-- 4. Show the UUID used for the test user
SELECT '550e8400-e29b-41d4-a716-446655440000'::uuid as test_user_uuid;