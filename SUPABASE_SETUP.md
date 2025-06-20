# Supabase Authentication Setup Guide

This guide will help you set up real Supabase authentication for the Logistics Investment Optimizer app.

## Current Status

✅ **Development Mode**: The app currently runs in development mode with mock authentication
- Login with: `demo@example.com` / `demo123`
- Registration works with any valid email and password (6+ characters)

⚠️ **Production Ready**: To enable real authentication, follow the steps below

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Wait for the project to be set up (takes ~2 minutes)

### 2. Get Your Credentials

From your Supabase project dashboard:

1. Go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (the `anon` key, not the service role key)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy from .env.example and fill in your values
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up Authentication

In your Supabase dashboard:

1. Go to **Authentication** > **Settings**
2. Configure **Site URL**: `http://localhost:5173` (for development)
3. Add your production domain when deploying
4. **Email Templates**: Customize if needed
5. **Providers**: Email is enabled by default

### 5. Database Tables (Already Created)

The following tables are already set up in your migrations:

- `user_subscriptions` - User subscription data
- `user_settings` - User preferences
- `saved_products` - Saved product presets
- `saved_containers` - Saved container presets
- `shipments` - User shipments

### 6. Test the Integration

1. Restart your development server: `npm run dev`
2. You should see: "✅ Connected to Supabase: your-url" in the console
3. Try registering a new account with a real email
4. Check your email for the confirmation link
5. Login with your new credentials

## Features Enabled with Real Supabase

✅ **Secure Authentication**: Real email/password validation
✅ **Email Confirmation**: Users must verify their email
✅ **Password Reset**: Built-in password recovery
✅ **Session Management**: Automatic token refresh
✅ **Database Integration**: Save shipments, products, containers
✅ **User Profiles**: Subscription tiers and settings

## Troubleshooting

### "Invalid credentials" error
- Check that your environment variables are correct
- Restart the development server after adding .env file
- Verify the user exists and email is confirmed

### "Check your email for confirmation"
- This is normal for new registrations
- Users must click the confirmation link in their email
- Check spam folder if email doesn't arrive

### Database errors
- Ensure you've run the migrations in `supabase/migrations/`
- Check RLS (Row Level Security) policies are set up correctly

## Security Notes

🔒 **Environment Variables**: Never commit `.env` files to git
🔒 **API Keys**: Only use the `anon` key, never the `service_role` key in frontend
🔒 **RLS Policies**: Database access is protected by Row Level Security
🔒 **HTTPS**: Always use HTTPS in production

## Next Steps

Once Supabase is configured:

1. **Email Templates**: Customize the authentication emails
2. **Social Login**: Add Google, GitHub, etc. providers
3. **Database Policies**: Review and customize RLS policies
4. **Production Deploy**: Add production URL to Supabase settings
5. **Monitoring**: Set up Supabase monitoring and alerts

---

For questions or issues, check the [Supabase Documentation](https://supabase.com/docs) or the project's GitHub issues.