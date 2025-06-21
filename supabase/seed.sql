-- Seed file to create demo user for testing
-- This runs automatically when supabase db reset is called

-- Create demo user with proper password hash
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '00000000-0000-0000-0000-000000000000',
    'demo@example.com',
    crypt('demo123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"email":"demo@example.com"}',
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW(),
    email_confirmed_at = NOW();

-- Create corresponding profile
INSERT INTO public.profiles (
    id,
    email,
    subscription_tier,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'demo@example.com',
    'premium',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- Create user settings
INSERT INTO public.user_settings (
    user_id,
    measurement,
    currency,
    language,
    show_tooltips,
    folders,
    shipment_folders,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'metric',
    'USD',
    'en',
    true,
    '[{"id": "1", "name": "Q1 2024"}, {"id": "2", "name": "Electronics"}, {"id": "3", "name": "Archived"}]',
    '{}',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    updated_at = NOW();

-- Create user subscription
INSERT INTO public.user_subscriptions (
    user_id,
    subscription_tier,
    status,
    started_at,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'premium',
    'active',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = EXCLUDED.subscription_tier,
    status = EXCLUDED.status,
    updated_at = NOW();