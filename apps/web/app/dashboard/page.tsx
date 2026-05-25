import { ServerCard } from '../../components/server/ServerCard';
import { CreateServerModal } from '../../components/server/CreateServerModal';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import type { ServerRow } from '../../types';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: servers } = await supabase
    .from('servers')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<ServerRow[]>();

  return (
    <main className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-100">Servers</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Monitor and coordinate your real-time running instances.
          </p>
        </div>
        <CreateServerModal />
      </div>

      {servers && servers.length > 0 ? (
        <div className="grid gap-4">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center relative overflow-hidden">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v3.75a3 3 0 0 1-3 3m-13.5 0a3 3 0 0 0-3 3v1.5a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-3-3" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-stone-200">No active servers</h3>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
            You haven't deployed any game servers yet. Deploy your first server and start playing in less than a minute.
          </p>
          <div className="mt-5 flex justify-center">
            <CreateServerModal />
          </div>
        </div>
      )}
    </main>
  );

}
