# Create Supabase Storage Bucket

## Error: "Bucket not found"

You're getting this error because the `series` bucket doesn't exist in Supabase Storage yet.

## Quick Fix (2 minutes)

### Step 1: Go to Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project

### Step 2: Create Storage Bucket
1. Click **Storage** in the left sidebar
2. Click **New bucket** button (top right)
3. Fill in:
   - **Name**: `series`
   - **Public bucket**: ✅ **Check this** (so images are publicly accessible)
4. Click **Create bucket**

### Step 3: Set Bucket Policies (Optional but Recommended)

1. Go to **Storage** → **Policies**
2. Select the `series` bucket
3. Add these policies:

**Policy 1: Public Read Access**
- **Policy name**: "Public read access"
- **Allowed operation**: SELECT
- **Policy definition**: `true`

**Policy 2: Authenticated Upload**
- **Policy name**: "Authenticated upload"
- **Allowed operation**: INSERT
- **Policy definition**: `auth.role() = 'authenticated'`

Or for testing, you can use:
- **Policy definition**: `true` (allows anyone to upload - for development only!)

### Step 4: Test Again
1. Go back to your admin dashboard
2. Try creating a series with an image
3. It should work now!

## Alternative: Use Different Bucket Name

If you want to use a different bucket name (like `thumbnails` or `images`), update the code:

In `app/series/new/page.tsx`, change:
```typescript
imageUrl = await uploadToSupabase(formData.imageFile, 'series', path);
```

To:
```typescript
imageUrl = await uploadToSupabase(formData.imageFile, 'thumbnails', path);
// or 'images', or whatever bucket name you prefer
```

## Bucket Configuration

- **Name**: `series` (or your preferred name)
- **Public**: ✅ Yes (for public image access)
- **File size limit**: Default is fine (or set your own limit)
- **Allowed MIME types**: Leave empty for all types, or specify `image/*`

