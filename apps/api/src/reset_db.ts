import { supabaseAdmin } from './lib/supabase.js';
import { logger } from './lib/logger.js';

async function run() {
  logger.info('Resetting all servers in the database to offline...');
  const { data, error } = await supabaseAdmin
    .from('servers')
    .update({
      status: 'offline',
      container_id: null,
      tunnel_ip: null,
      tunnel_port: null,
    })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // matches all rows

  if (error) {
    logger.error({ error }, 'Failed to reset servers');
  } else {
    logger.info({ data }, 'Successfully reset all servers in the database to offline/clean state');
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
