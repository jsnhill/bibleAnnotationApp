# Bible Study Group Application

A collaborative Bible reading and commentary application for small groups (up to 20 users).

## Features

✅ **Shared Authentication** - Simple shared password + user selection
✅ **Verse-by-Verse Reading** - Click any verse to comment
✅ **Visual Indicators** - See who has commented (💬 icon + initials)
✅ **Comment System** - View all comments from all users in one place
✅ **Reading Completion Tracking** - Mark readings as finished
✅ **Admin Panel** - Schedule readings with book/chapter selection
✅ **Pre-loaded Bible** - World English Bible (public domain)
✅ **Navigation** - Previous/Next buttons to move between readings

## Technology Stack

- **Frontend**: Next.js 14 (React) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom (shared password + user selection)
- **Hosting**: Vercel (free tier)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- A Vercel account for deployment (optional, free tier available)

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the schema from `lib/schema.sql` to create all tables
4. Note your project URL and anon key from **Settings** > **API**

### 3. Import Bible Data

**Quick Start: Use Sample Data (Fastest)**
1. Run `lib/sample-data.sql` in Supabase SQL Editor
2. This gives you James 1, John 3, and Psalm 23 to test with
3. Import the full Bible later when ready

**Full Bible Import (7 minutes):**

**RECOMMENDED:** Use the BibleWorks VPL+SQL format from eBible.org

1. Download: https://ebible.org/Scriptures/engwebp_vpl.zip
2. Extract and find the .sql file
3. Run: `python3 convert_vpl_sql.py extracted_file.sql bible_import.sql`
4. Import `bible_import.sql` in Supabase SQL Editor

**See VPL_IMPORT_GUIDE.md for step-by-step instructions with screenshots!**

Alternative methods available in BIBLE_IMPORT_GUIDE.md

### 4. Local Development Setup

1. Clone or download this repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

### 5. Initial Configuration

1. **Set Shared Password**
   - Default password is `BibleStudy2024`
   - Change it in Supabase: Table Editor > app_settings > update 'shared_password'

2. **Create Admin User**
   - Access the app and register as a user
   - Note your user ID from Supabase Table Editor > users
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_ADMIN_USER_ID=your-user-id
     ```

3. **Schedule First Reading**
   - Login as admin user
   - Click "Admin Panel"
   - Select book, chapter, and date range
   - Click "Schedule Reading"

### 6. Deployment to Vercel

1. Push code to GitHub repository

2. Go to https://vercel.com and click "New Project"

3. Import your GitHub repository

4. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_USER_ID`

5. Deploy!

## Usage Guide

### For Users

1. **Login**
   - Enter the shared password
   - Select your name or register if first time

2. **Reading**
   - View current week's reading
   - Click any verse to add a comment
   - See 💬 icon for verses with comments
   - Click verses with comments to view all comments
   - Mark reading as complete when finished

3. **Navigation**
   - Use "Previous" and "Next" buttons to browse other readings

### For Admins

1. **Access Admin Panel**
   - Click "Admin Panel" button in navigation (only visible to admin)

2. **Schedule Readings**
   - Select book from dropdown
   - Enter chapter number
   - Set start and end dates
   - Click "Schedule Reading"

3. **Manage Readings**
   - View all scheduled readings
   - See who completed each reading
   - Delete readings if needed

## Database Schema

### Tables

- **users** - User profiles with names and initials
- **bible_verses** - Complete Bible text (pre-loaded)
- **readings** - Scheduled reading assignments
- **comments** - User comments on verses
- **reading_completions** - Tracking who finished what
- **app_settings** - Configuration (shared password)

## Customization Options

### Change Shared Password
Update in Supabase:
```sql
UPDATE app_settings SET value = 'NewPassword123' WHERE key = 'shared_password';
```

### Add More Admins
You can modify the admin check logic in `app/page.tsx` to support multiple admins:
```typescript
const ADMIN_USER_IDS = [
  'user-id-1',
  'user-id-2',
  'user-id-3'
];
setIsAdmin(ADMIN_USER_IDS.includes(storedUserId));
```

### Customize Styling
Edit colors in `tailwind.config.js` or modify component styles directly.

### Limit Comment Length
Add maxLength to textarea in `components/CommentModal.tsx`:
```tsx
<textarea maxLength={500} ... />
```

## Cost Estimate

**Total Cost: $0-25/month**

- **Supabase Free Tier**: Up to 500MB database, 50K monthly active users
- **Vercel Free Tier**: Unlimited personal projects
- **Total**: $0 for small groups under 20 users

If you exceed free tier limits (unlikely for 20 users):
- **Supabase Pro**: $25/month (8GB database, 100K MAU)

## Troubleshooting

### "No Active Reading" message
- Make sure you've scheduled a reading in the admin panel
- Check that today's date falls within the start/end date range

### Comments not showing
- Verify the reading_id matches in the comments table
- Check browser console for errors (F12)

### Can't see Admin Panel
- Verify your user ID is set in NEXT_PUBLIC_ADMIN_USER_ID
- Logout and login again after setting the environment variable

### Bible verses not loading
- Verify bible_verses table has data
- Check table name matches exactly (lowercase)

## Support & Contributing

For questions or issues, refer to:
- Next.js docs: https://nextjs.org/docs
- Supabase docs: https://supabase.com/docs
- Tailwind docs: https://tailwindcss.com/docs

## License

This project uses the World English Bible translation, which is in the public domain.

Application code is provided as-is for personal use.
