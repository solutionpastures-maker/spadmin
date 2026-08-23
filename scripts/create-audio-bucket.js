/**
 * Create the sermon-audio Supabase Storage bucket (public read, large audio files).
 * Run: npm run create-audio-bucket
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const BUCKET = 'sermon-audio';

// Per-bucket limit cannot exceed your project's global limit (Free: 50MB, Pro+: higher).
const DEFAULT_MB = 50;
const envMb = parseInt(process.env.SERMON_AUDIO_MAX_MB || '', 10);
const fileSizeLimitMb = Number.isFinite(envMb) && envMb > 0 ? envMb : DEFAULT_MB;
const fileSizeLimit = fileSizeLimitMb * 1024 * 1024;

async function createAudioBucket() {
  try {
    console.log(`Creating "${BUCKET}" bucket (max ${fileSizeLimitMb}MB per file)...`);

    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit,
      allowedMimeTypes: [
        'audio/mpeg',
        'audio/mp4',
        'audio/aac',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
        'audio/x-m4a',
      ],
    });

    if (error) {
      if (
        error.message?.includes('already exists') ||
        error.message?.includes('duplicate') ||
        error.statusCode === 409
      ) {
        console.log(`✓ Bucket "${BUCKET}" already exists — nothing to do.`);
        console.log(`  ${supabaseUrl}/storage/v1/object/public/${BUCKET}/<path>`);
        return;
      }
      throw error;
    }

    console.log(`Bucket "${BUCKET}" created successfully`);
    console.log('\nPublic URLs will work at:');
    console.log(`  ${supabaseUrl}/storage/v1/object/public/${BUCKET}/<path>`);
    if (fileSizeLimitMb <= 50) {
      console.log(
        '\nTip: Free tier caps uploads at 50MB. For longer sermons, upgrade Supabase or split into parts.'
      );
    }
  } catch (err) {
    const msg = err.message || String(err);
    console.error('Error creating bucket:', msg);
    if (/maximum allowed size/i.test(msg)) {
      console.error(
        '\nYour project global file size limit is lower than SERMON_AUDIO_MAX_MB.',
        'Set SERMON_AUDIO_MAX_MB=50 (or omit it) and retry, or raise the limit in',
        'Supabase Dashboard → Project Settings → Storage.'
      );
    }
    process.exit(1);
  }
}

createAudioBucket();
