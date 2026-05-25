import { notFound, redirect } from 'next/navigation';

import { ServerDetailView } from '../../../components/server/ServerDetailView';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import type { ServerRow } from '../../../types';

export default async function ServerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: server } = await supabase
    .from('servers')
    .select('*')
    .eq('id', id)
    .maybeSingle<ServerRow>();

  if (!server) {
    notFound();
  }

  return (
    <ServerDetailView
      initialServer={server}
      userEmail={user.email ?? 'Player'}
    />
  );
}
