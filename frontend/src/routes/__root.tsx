import type { ReactElement } from 'react';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Home, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout(): ReactElement {
  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center gap-4 border-b border-border px-4">
        <span className="font-semibold text-foreground">MBV2</span>
        <Separator orientation="vertical" className="h-6" />
      </header>

      {/* Main: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-muted/30 py-2">
          <nav className="flex flex-col gap-1 px-2">
            <Button variant="ghost" className="justify-start" asChild>
              <Link
                to="/"
                className={cn(
                  'w-full [&.active]:bg-accent [&.active]:font-medium',
                )}
              >
                <Home className="mr-2 size-4" />
                Accueil
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link
                to="/bibliotheque"
                className={cn(
                  'w-full [&.active]:bg-accent [&.active]:font-medium',
                )}
              >
                <Library className="mr-2 size-4" />
                Bibliothèque
              </Link>
            </Button>
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
