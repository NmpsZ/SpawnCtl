import { supabaseAdmin } from './lib/supabase.js';
import { logger } from './lib/logger.js';

async function run() {
  const { data, error } = await supabaseAdmin.from('servers').select('*');
  if (error) {
    logger.error({ error }, 'Failed to fetch servers');
  } else {
    logger.info({ data }, 'Active servers in database');
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
