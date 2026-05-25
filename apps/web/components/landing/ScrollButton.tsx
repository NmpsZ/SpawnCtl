'use client';

import React from 'react';

interface ScrollButtonProps {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}

export function ScrollButton({ targetId, children, className }: ScrollButtonProps) {
  const handleScroll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button onClick={handleScroll} className={className}>
      {children}
    </button>
  );
}
