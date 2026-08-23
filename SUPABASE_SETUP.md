# Supabase Setup for Series & Episodes

## Overview
Only **Series** and **Episodes** data will be stored in Supabase. Everything else (users, announcements, comments, devotionals) remains in Firebase/Firestore.

## Setup Steps

### 1. Create Supabase Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `../sppod2/database/schema.sql`
4. Click **Run**
5. This creates the `series` and `episodes` tables

### 2. Create Supabase Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `series`
4. **Public bucket**: ✅ Check this
5. Click **Create bucket**

### 3. Configure Environment Variables

Create a `.env.local` file in the `spadmin` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (SERVER-SIDE ONLY!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important**: 
- Get the service role key from Supabase Dashboard → Settings → API
- **Never expose the service role key to the client!**
- Only use it in server-side code (API routes, server components)

### 4. Update Code

The admin tool has been updated to use Supabase for series/episodes:
- ✅ `lib/supabase-admin.ts` - Admin functions for Supabase
- ✅ `app/series/new/page.tsx` - Uses Supabase for creating series
- ✅ `app/series/page.tsx` - Uses Supabase for listing series
- ✅ `app/series/[seriesId]/episodes/new/page.tsx` - Uses Supabase for creating episodes

### 5. Data Flow

**Admin Tool (Next.js)**:
- Uses `supabase-admin.ts` with service role key
- Can create, update, delete series/episodes
- Uploads images to Supabase Storage

**Mobile App (React Native)**:
- Will use Supabase public client (anon key)
- Can read series/episodes (public read access)
- Cannot write (admin-only)

**Firebase/Firestore**:
- Users, announcements, comments, devotionals
- All authentication
- All user data

## Testing

1. **Create a Series**:
   - Go to Series → New Series
   - Fill in form and upload image
   - Should save to Supabase

2. **Create an Episode**:
   - Go to a Series → New Episode
   - Add Google Drive links for parts
   - Should save to Supabase

3. **Verify Data**:
   - Check Supabase Dashboard → Table Editor
   - You should see your series and episodes

## Troubleshooting

### "Missing environment variables"
- Make sure `.env.local` has all Supabase variables
- Restart Next.js dev server after adding env vars

### "Permission denied"
- Check that service role key is correct
- Verify RLS policies allow service role access

### "Bucket not found"
- Make sure `series` bucket exists in Supabase Storage
- Check bucket is set to public

### Image upload fails
- Verify Supabase Storage bucket exists
- Check bucket policies allow uploads
- Make sure using `uploadToSupabase` function

