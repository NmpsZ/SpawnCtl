'use client';

import { useState, useEffect, useRef } from 'react';
import { useServerLogs } from '../../hooks/useServerLogs';
import { apiFetch } from '../../lib/api-client';
import { SendHorizonal } from 'lucide-react';

export function TerminalView({ serverId, isRunning }: { serverId: string; isRunning: boolean }) {
  const { lines } = useServerLogs(serverId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [command, setCommand] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSendCommand = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!command.trim() || isSending) return;

    try {
      setIsSending(true);
      await apiFetch(`/api/v1/servers/${serverId}/command`, {
        method: 'POST',
        body: JSON.stringify({ command: command.trim() }),
      });
      setCommand('');
    } catch (error) {
      console.error('Failed to send command:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <section
        ref={scrollRef}
        className="h-[500px] overflow-y-auto rounded-lg border border-stone-900 bg-stone-950 p-4 font-mono text-sm text-emerald-100 scroll-smooth"
      >
        {lines.map((line, index) => (
          <div key={`${index}`} className="whitespace-pre-wrap break-words min-h-[1.25rem]">
            {line}
          </div>
        ))}
      </section>
      
      {isRunning && (
        <form 
          onSubmit={handleSendCommand}
          className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900/50 p-2"
        >
          <span className="text-emerald-500 font-mono pl-2">{'>'}</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            disabled={isSending}
            placeholder="Enter command (e.g., /op username, /time set day)"
            className="flex-1 bg-transparent px-2 py-1 font-mono text-sm text-stone-200 outline-none placeholder:text-stone-600 disabled:opacity-50"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={!command.trim() || isSending}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200 disabled:opacity-50 transition-colors"
            title="Send Command"
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
