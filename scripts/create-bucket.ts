/**
 * Script to create Supabase Storage bucket
 * Run with: npx tsx scripts/create-bucket.ts
 * Or: node --loader ts-node/esm scripts/create-bucket.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
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
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('✅ Bucket "series" already exists');
        return;
      }
      throw error;
    }

    console.log('✅ Bucket "series" created successfully!');
    console.log('Bucket details:', data);
    
    // Set up policies
    console.log('\nSetting up bucket policies...');
    
    // Note: Storage policies are set via the Supabase dashboard or REST API
    // The Storage API doesn't have a direct method to set policies
    console.log('⚠️  Please set bucket policies manually in Supabase Dashboard:');
    console.log('   1. Go to Storage → Policies');
    console.log('   2. Select "series" bucket');
    console.log('   3. Add policy: INSERT with definition "true" (for development)');
    
  } catch (error: any) {
    console.error('❌ Error creating bucket:', error.message);
    process.exit(1);
  }
}

createBucket();

