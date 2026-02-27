'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, Users, AlertTriangle } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Ad Rankings', href: '/rankings', icon: Target },
    { name: 'Segmentation', href: '/segmentation', icon: Users },
    { name: 'Insights & Alerts', href: '/insights', icon: AlertTriangle },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-full flex flex-col fixed left-0 top-0 pt-16 z-10 transition-colors">
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive 
                  ? 'bg-opti-blue text-white' 
                  : 'text-text-secondary hover:bg-opti-light-blue/10 hover:text-opti-blue'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-[14px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
