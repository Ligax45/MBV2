import { Link } from '@tanstack/react-router';
import { ChefHat, Home, Library, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

const navLinks = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/bibliotheque', label: 'Bibliothèque', icon: Library },
  { to: '/createRecipe', label: 'Créer une recette', icon: ChefHat },
] as const;

export const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le menu"
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-52 max-w-[85vw] flex-col border-r border-border bg-background py-2 shadow-lg md:hidden',
        )}
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="font-semibold text-foreground">MiamBook</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Fermer le menu"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </div>
        <nav className="flex flex-col gap-1 px-2 pt-4">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Button key={to} variant="ghost" className="justify-start" asChild>
              <Link
                to={to}
                className={cn('w-full [&.active]:bg-accent [&.active]:font-medium')}
                onClick={onClose}
              >
                <Icon className="mr-2 size-4" />
                {label}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>
    </>
  );
};
