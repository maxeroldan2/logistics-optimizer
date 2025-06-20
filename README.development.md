# Local Development Setup

This project now supports local development using Supabase CLI and Docker.

## Prerequisites

- Docker installed and running
- Node.js and npm
- Supabase CLI (automatically installed to `~/bin/supabase`)

## Quick Start

1. **Start local Supabase services:**
   ```bash
   npm run supabase:start
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - App: http://localhost:5173
   - Supabase Studio: http://127.0.0.1:54323

## Available Scripts

- `npm run supabase:start` - Start local Supabase services
- `npm run supabase:stop` - Stop local services
- `npm run supabase:reset` - Reset database and apply migrations
- `npm run supabase:studio` - Open Supabase Studio
- `npm run supabase:status` - Check service status

## Local Configuration

The app automatically uses local Supabase when:
- `.env.local` exists with local URLs (created automatically)
- Or when `VITE_SUPABASE_URL` contains `127.0.0.1` or `localhost`

Local services run on:
- API Gateway: http://127.0.0.1:54321
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- Studio: http://127.0.0.1:54323

## Database Migrations

Migrations are automatically applied when you run:
```bash
npm run supabase:reset
```

The schema includes:
- User profiles with subscription tiers
- Shipments and folders
- Containers and products
- Saved presets
- Row Level Security (RLS) policies

## Migration to Production

When ready to deploy:

1. **Create a Supabase project** at https://supabase.com
2. **Push your schema:**
   ```bash
   ~/bin/supabase link --project-ref your-project-ref
   ~/bin/supabase db push
   ```
3. **Update environment variables** with production URLs
4. **Deploy your app** to your preferred hosting platform

## Troubleshooting

- If services won't start, ensure Docker is running
- Use `npm run supabase:status` to check service health
- Reset everything with `npm run supabase:reset`
- Check logs with `docker logs supabase_db_logis`