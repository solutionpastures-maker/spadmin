# Supabase Storage Bucket Setup

## Fixed: Series Image Upload

I've updated the series creation page to use Supabase Storage instead of Firebase Storage. This avoids CORS issues.

## Create Supabase Storage Bucket

You need to create a `series` bucket in Supabase Storage:

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click **Storage** in the left sidebar
   - Click **New bucket**

3. **Create Bucket**
   - **Name**: `series`
   - **Public bucket**: ✅ Check this (so images are publicly accessible)
   - Click **Create bucket**

4. **Set Bucket Policies** (if needed)
   - Go to **Storage** → **Policies**
   - For the `series` bucket, add policies:
     - **Policy name**: "Allow public read"
     - **Allowed operation**: SELECT
     - **Policy definition**: `true` (allow all reads)
     
     - **Policy name**: "Allow authenticated upload"
     - **Allowed operation**: INSERT
     - **Policy definition**: `auth.role() = 'authenticated'` (or `true` for testing)

## Alternative: Use Existing Bucket

If you already have a bucket for images (like `thumbnails` or `images`), you can update the code to use that bucket instead.

In `app/series/new/page.tsx`, change:
```typescript
imageUrl = await uploadToSupabase(formData.imageFile, 'series', path);
```

To:
```typescript
imageUrl = await uploadToSupabase(formData.imageFile, 'thumbnails', path);
// or 'images', or whatever bucket you're using
```

## Test the Upload

After creating the bucket:
1. Go to the admin dashboard
2. Navigate to **Series** → **New Series**
3. Fill in the form and upload an image
4. The upload should now work without CORS errors!

