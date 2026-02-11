# Vercel Cron for Facebook posts crawler

This project includes a Vercel cron configuration that calls `/api/cron` once per hour.

Files added:

- `vercel.json` — configures a cron job that calls `/api/cron` every hour (schedule `0 * * * *`).
- `app/api/cron/route.ts` — the API route that performs the GET request to the RapidAPI facebook-scraper endpoint and returns the JSON (ensures a `posts` array).
- `app/api/cron/route.ts` — the API route that performs the GET request to the RapidAPI facebook-scraper endpoint, parses the `posts` array and (optionally) persists posts into a `facebook_posts` table in your Supabase DB.

## Environment variable

Set the RapidAPI key as an environment variable named `RAPIDAPI_KEY` in your Vercel project settings (Production and Preview as needed). Do NOT commit your API key to source control.

## Supabase persistence (optional)

The cron route can persist scraped posts into a `facebook_posts` table using a Supabase service role key. To enable persistence:

1. Create a Supabase environment variable in Vercel named `NEXT_PUBLIC_SUPABASE_URL` pointing to your Supabase URL.
2. Add `SUPABASE_SERVICE_ROLE_KEY` (service_role key) in Vercel — this must be kept secret and never exposed to the browser.

The handler will attempt to upsert rows into a table named `facebook_posts`. If that table does not exist you'll receive an error response that includes a SQL snippet to create it. Example SQL (also printed by the handler):

```sql
-- Create a table for storing scraped Facebook posts
CREATE TABLE IF NOT EXISTS facebook_posts (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	external_id TEXT UNIQUE,
	url TEXT,
	message TEXT,
	author_id TEXT,
	author_name TEXT,
	author_url TEXT,
	author_avatar_url TEXT,
	posted_at TIMESTAMP WITH TIME ZONE,
	comments_count INT,
	reactions_count INT,
	reshare_count INT,
	raw JSONB,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

If you prefer to persist scraped posts into your existing `posts` table, contact me and I can adapt the mapping and choose a service user id to own those posts (or add a dedicated `crawler_user_id` env var).

## Local testing

Start the dev server and set the env var in PowerShell for the session:

```powershell
$env:RAPIDAPI_KEY = 'your-rapidapi-key-here'
pnpm dev
```

Then request the route locally:

```powershell
curl --request GET --url "http://localhost:3000/api/cron"
```

## Deployment notes

After you push, Vercel will create the scheduled job (hourly at minute 0). The cron handler will call the RapidAPI endpoint and return the response body which should contain a `posts` array.

If you want a different schedule (e.g., every 30 minutes), edit `vercel.json` using a cron expression like `*/30 * * * *` and redeploy.
