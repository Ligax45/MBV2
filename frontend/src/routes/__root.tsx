import type { ReactElement } from 'react';
import { useState } from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Topbar } from '@/features/topbar/Topbar';
import { MobileMenu } from '@/features/sidebar/MobileMenu';
import { Sidebar } from '@/features/sidebar/Sidebar';

const RootLayout = (): ReactElement => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <Topbar onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const Route = createRootRoute({
  component: RootLayout,
});
