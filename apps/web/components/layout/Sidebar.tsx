'use client';

import { Activity, BookOpen, Server, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Servers',
      href: '/dashboard',
      icon: Server,
    },
    {
      name: 'System Health',
      href: '/dashboard/health',
      icon: Activity,
    },
    {
      name: 'Usage Guides',
      href: '/dashboard/guides',
      icon: BookOpen,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="h-fit rounded-xl border border-zinc-900 bg-zinc-900/40 backdrop-blur-md p-3 relative overflow-hidden">
      {/* Subtle background glow element */}
      <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-indigo-500/5 blur-xl pointer-events-none" />

      <nav className="grid gap-1.5 relative z-10">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold border transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-sm shadow-indigo-950/20'
                  : 'text-zinc-400 hover:text-stone-100 hover:bg-zinc-900/40 border-transparent hover:border-zinc-900'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
              {item.name}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}


