import { Link } from '@tanstack/react-router';
import { Home, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

export function Sidebar() {
  return (
    <aside className="flex min-w-52 w-52 max-w-52 shrink-0 flex-col border-r border-border py-2">
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
  );
}
