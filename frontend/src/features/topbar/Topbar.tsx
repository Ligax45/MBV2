import { Menu, Moon, Settings, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

type TopbarProps = {
  onMobileMenuToggle?: () => void;
};

export const Topbar = ({ onMobileMenuToggle }: TopbarProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border">
      <div className="flex shrink-0 items-center gap-2 border-r border-border px-2 md:min-w-52 md:w-52">
        {onMobileMenuToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Ouvrir le menu"
            onClick={onMobileMenuToggle}
          >
            <Menu className="size-5" />
          </Button>
        )}
        <span className="font-semibold text-foreground">MiamBook</span>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2 px-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          title={
            theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'
          }
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <Moon className="size-5" />
          ) : (
            <Sun className="size-5" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Réglages"
          title="Réglages"
        >
          <Settings className="size-5" />
        </Button>
        <Avatar>
          <AvatarImage
            src="https://avatar.vercel.sh/miambook"
            alt="Avatar utilisateur"
          />
          <AvatarFallback>MB</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
