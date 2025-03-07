'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, User, LogOut, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  onLogout: () => void;
}

const sidebarItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Tax', href: '/dashboard/tax', icon: Calculator },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-16 flex-col justify-between border-r bg-background shadow-md">
      <TooltipProvider>
        <div>
          <div className="flex h-16 items-center justify-center">
            <ThemeToggle />
          </div>
          <nav className="space-y-2 py-4">
            {sidebarItems.map((item) => (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'w-full transition-all duration-300 ease-in-out',
                        pathname === item.href
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-primary/10'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.name}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </div>
        <div className="space-y-2 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full" onClick={onLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Log out</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
