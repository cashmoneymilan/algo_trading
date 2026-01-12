'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AlertMonitor } from '@/components/alerts/AlertMonitor';
import { HotkeyProvider } from '@/components/hotkeys/HotkeyProvider';
import { HotkeyHelpModal } from '@/components/hotkeys/HotkeyHelpModal';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={300}>
        <HotkeyProvider>
          {children}
          <AlertMonitor />
          <HotkeyHelpModal />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              },
            }}
            theme="dark"
          />
        </HotkeyProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
