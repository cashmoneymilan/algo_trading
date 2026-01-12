'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/stores/uiStore';
import { useMarketDataStore } from '@/stores/marketDataStore';
import {
  Sun,
  Moon,
  Monitor,
  Eye,
  Settings,
  Wifi,
  WifiOff,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, setTheme } = useTheme();
  const colorblindMode = useUIStore((state) => state.colorblindMode);
  const toggleColorblindMode = useUIStore((state) => state.toggleColorblindMode);
  const connectionStatus = useMarketDataStore((state) => state.connectionStatus);

  const isConnected = connectionStatus === 'connected';

  return (
    <header className="h-14 border-b border-border bg-surface-1 flex items-center justify-between px-4">
      {/* Left side - Logo and title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <LayoutGrid className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-lg">Trading Platform</h1>
          <p className="text-xs text-muted-foreground">Powered by Alpaca</p>
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* Connection status */}
        <div className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded text-xs',
          isConnected ? 'bg-bullish/10 text-bullish' : 'bg-muted text-muted-foreground'
        )}>
          {isConnected ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          <span>{isConnected ? 'Connected' : connectionStatus}</span>
        </div>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="h-4 w-4 mr-2" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="h-4 w-4 mr-2" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={toggleColorblindMode}>
              <Eye className="h-4 w-4 mr-2" />
              <span className="flex-1">Colorblind Mode</span>
              {colorblindMode && (
                <span className="text-xs text-muted-foreground">On</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              More settings coming soon
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
