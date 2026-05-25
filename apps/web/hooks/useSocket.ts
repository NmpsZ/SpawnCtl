'use client';

export function useSocket() {
  return {
    isConnected: false,
    socket: null,
  };
}
