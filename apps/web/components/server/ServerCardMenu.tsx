'use client';

import {
  MoreVertical,
  Copy,
  Check,
  Settings,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '../ui/button';
import { apiFetch } from '../../lib/api-client';
import { createPortal } from 'react-dom';

/* -------------------------------------------------------------------------- */
/*  Delete Confirmation Dialog                                                */
/* -------------------------------------------------------------------------- */

function DeleteConfirmDialog({
  serverId,
  game,
  onClose,
}: {
  serverId: string;
  game: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isPending, onClose]);

  async function handleDelete() {
    setIsPending(true);
    setErrorMessage(null);

    try {
      await apiFetch(`/api/v1/servers/${serverId}`, {
        method: 'DELETE',
      });
      onClose();
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete server.');
      setIsPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          if (!isPending) onClose();
        }}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close button */}
        <button
          className="absolute right-3 top-3 rounded-full p-1 text-zinc-500 hover:bg-zinc-800 hover:text-stone-200 transition-colors"
          disabled={isPending}
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon + Title */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 rounded-full bg-rose-500/10 p-3">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
          </div>
          <h3 className="text-lg font-black text-stone-100 tracking-tight">Delete Server</h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Are you sure you want to delete this{' '}
            <span className="font-extrabold capitalize text-indigo-400">{game}</span> server?
            This action is permanent and cannot be undone.
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            disabled={isPending}
            onClick={onClose}
            type="button"
            className="bg-zinc-800 hover:bg-zinc-700 text-stone-200 border-zinc-700/60 rounded-xl h-9 text-xs font-bold px-4"
          >
            Cancel
          </Button>
          <Button
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl h-9 text-xs px-4"
            disabled={isPending}
            onClick={handleDelete}
            type="button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Kebab Menu                                                                */
/* -------------------------------------------------------------------------- */

export function ServerCardMenu({
  serverId,
  game,
  tunnelAddress,
  onOpenChange,
}: {
  serverId: string;
  game: string;
  tunnelAddress?: string | null;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Notify parent of open state change (menu or delete dialog open)
  useEffect(() => {
    onOpenChange?.(isOpen || showDeleteDialog);
  }, [isOpen, showDeleteDialog, onOpenChange]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(serverId);
      setCopiedId(true);
      setTimeout(() => {
        setCopiedId(false);
        setIsOpen(false);
      }, 800);
    } catch {
      // Clipboard not available
      setIsOpen(false);
    }
  }

  async function handleCopyIp() {
    if (!tunnelAddress) return;
    try {
      await navigator.clipboard.writeText(tunnelAddress);
      setCopiedIp(true);
      setTimeout(() => {
        setCopiedIp(false);
        setIsOpen(false);
      }, 800);
    } catch {
      // Clipboard not available
      setIsOpen(false);
    }
  }

  function handleSettings() {
    setIsOpen(false);
    window.location.href = `/servers/${serverId}`;
  }

  function handleDeleteClick() {
    setIsOpen(false);
    setShowDeleteDialog(true);
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        {/* Trigger */}
        <Button
          aria-label="Server menu"
          className="text-zinc-500 hover:text-stone-100 hover:bg-zinc-900/60 rounded-xl"
          onClick={() => setIsOpen((prev) => !prev)}
          size="icon"
          title="More options"
          type="button"
          variant="ghost"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full z-40 mt-1.5 w-48 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-2xl animate-in fade-in slide-in-from-top-1.5 duration-150">
            {tunnelAddress && (
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-350 hover:bg-zinc-800/60 hover:text-stone-100 transition-colors"
                onClick={handleCopyIp}
                type="button"
              >
                {copiedIp ? (
                  <Check className="h-4 w-4 text-emerald-450 animate-in zoom-in duration-200" />
                ) : (
                  <Copy className="h-4 w-4 text-zinc-500" />
                )}
                {copiedIp ? 'Copied IP!' : 'Copy IP Address'}
              </button>
            )}

            <button
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-350 hover:bg-zinc-800/60 hover:text-stone-100 transition-colors"
              onClick={handleSettings}
              type="button"
            >
              <Settings className="h-4 w-4 text-zinc-500" />
              Settings
            </button>

            <div className="my-1 border-t border-zinc-800/80" />

            <button
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-rose-450 hover:bg-rose-950/20 hover:text-rose-400 transition-colors"
              onClick={handleDeleteClick}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              Delete Server
            </button>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      {showDeleteDialog && mounted && createPortal(
        <DeleteConfirmDialog
          game={game}
          onClose={() => setShowDeleteDialog(false)}
          serverId={serverId}
        />,
        document.body
      )}
    </>
  );
}
