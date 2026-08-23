# Create Supabase Storage Bucket

## Important Note
Supabase Storage buckets are **NOT created via SQL**. They use the Storage REST API.

## Option 1: Use the Script (Easiest)

I've created a script to create the bucket programmatically:

```bash
# Make sure you're in the spadmin directory
cd spadmin

# Install dotenv if not already installed
npm install dotenv

# Run the script
node scripts/create-bucket.js
```

This will:
- Create the `series` bucket
- Make it public
- Set file size limit to 10MB
- Allow common image types

## Option 2: Supabase Dashboard (Manual)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in left sidebar
4. Click **New bucket**
5. Name: `series`
6. **Public bucket**: ✅ Check this
7. Click **Create bucket**

## Option 3: Using Supabase REST API

You can also create it via REST API:

```bash
curl -X POST 'https://gduwwkrlyizmwdpctnjg.supabase.co/storage/v1/bucket' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "series",
    "public": true,
    "file_size_limit": 10485760,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/gif", "image/webp"]
  }'
```

## After Creating the Bucket

Set up storage policies:

1. Go to **Storage** → **Policies**
2. Select `series` bucket
3. Add policy:
   - **Policy name**: "Allow uploads"
   - **Allowed operation**: INSERT
   - **Policy definition**: `true` (for development)
   - Click **Save**

## Verify Bucket Exists

After creating, you can verify by:
1. Going to Storage in Supabase Dashboard
2. You should see the `series` bucket listed
3. Try uploading a test file

