#!/bin/bash

# Script to create test user in local Supabase database
# Make sure your local Supabase is running (supabase start)

echo "Creating test user in local Supabase database..."
echo "Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""

# Execute the SQL script
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f create-test-user.sql

echo ""
echo "Test user creation completed."
echo ""
echo "To verify the user was created, you can run:"
echo "psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c \"SELECT id, email, role, email_confirmed_at FROM auth.users WHERE email = 'demo@example.com';\""
echo ""
echo "To check if profile was created:"
echo "psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c \"SELECT * FROM public.profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000';\""