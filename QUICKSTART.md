# Quick Start Guide (15 Minutes)

Get your Bible Study app running in 15 minutes!

## Step 1: Supabase Setup (5 minutes)

1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Name it "bible-study" and set a password
4. Wait for project to initialize (~2 minutes)

## Step 2: Create Database Tables (2 minutes)

1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the entire contents of `lib/schema.sql`
4. Click **Run** (bottom right)
5. You should see "Success. No rows returned"

## Step 3: Import Bible Data (5 minutes)

**Quick Method** - Using sample data first:

1. In Supabase, go to **Table Editor** > **bible_verses**
2. Click **Insert row** and manually add a few verses for testing:
   - book_name: "James"
   - chapter: 1
   - verse: 1
   - text: "James, a servant of God and of the Lord Jesus Christ, to the twelve tribes which are scattered abroad: Greetings."
3. Repeat for verses 2-10 of James 1

**Full Import** - Do this later:
- Download CSV from https://ebible.org/find/show.php?id=engwebp
- Use Supabase's CSV import feature

## Step 4: Configure Your App (2 minutes)

1. In your project folder, copy `.env.example` to `.env.local`
2. In Supabase, go to **Settings** > **API**
3. Copy these values to `.env.local`:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY

## Step 5: Run Locally (1 minute)

```bash
npm install
npm run dev
```

Open http://localhost:3000

## First Time Use

1. **Default Password**: BibleStudy2024
2. Click "New User? Register Here"
3. Enter your first/last name
4. Note your user ID from Supabase (Table Editor > users)
5. Add to `.env.local`: NEXT_PUBLIC_ADMIN_USER_ID=your-user-id
6. Restart the dev server (Ctrl+C, then npm run dev)
7. Login again - you'll now see "Admin Panel"

## Schedule Your First Reading

1. Click "Admin Panel"
2. Select "James" from book dropdown
3. Enter chapter: 1
4. Set today as start date
5. Set 7 days from now as end date
6. Click "Schedule Reading"

## Test It Out

1. Click "Reading" to go back
2. You should see "James 1" with your test verses
3. Click a verse
4. Add a comment
5. See the 💬 icon appear!

## Deploy to Vercel (Optional - 5 minutes)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import from GitHub
5. Add the same environment variables from `.env.local`
6. Click "Deploy"
7. Share the URL with your group!

## Next Steps

- Change the shared password in Supabase
- Import the complete Bible (see README.md)
- Invite your group members
- Schedule more readings

## Quick Troubleshooting

**"No Active Reading" message?**
- Make sure today's date is between your start and end dates

**Can't see verses?**
- Add sample verses manually in Supabase Table Editor

**Admin Panel not showing?**
- Check NEXT_PUBLIC_ADMIN_USER_ID matches your user ID
- Restart dev server after changing .env.local

**Need help?**
- Check the full README.md for detailed instructions
- Verify all environment variables are set correctly
