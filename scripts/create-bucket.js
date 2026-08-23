/**
 * Script to create Supabase Storage bucket
 * Run with: node scripts/create-bucket.js
 * 
 * Make sure you have .env.local with:
 * NEXT_PUBLIC_SUPABASE_URL=your-url
 * SUPABASE_SERVICE_ROLE_KEY=your-key
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createBucket() {
  try {
    console.log('Creating "series" bucket...');
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('series', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (error) {
      // If bucket already exists, that's okay
      if (error.message.includes('already exists') || error.message.includes('duplicate') || error.statusCode === 409) {
        console.log('✅ Bucket "series" already exists');
        return;
      }
      throw error;
    }

    console.log('✅ Bucket "series" created successfully!');
    console.log('Bucket details:', data);
    
    console.log('\n⚠️  Next step: Set bucket policies in Supabase Dashboard:');
    console.log('   1. Go to Storage → Policies');
    console.log('   2. Select "series" bucket');
    console.log('   3. Add policy: INSERT with definition "true" (for development)');
    
  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
    process.exit(1);
  }
}

createBucket();

