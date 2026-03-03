import type { ReactElement } from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Topbar } from '@/features/topbar/Topbar';
import { Sidebar } from '@/features/sidebar/Sidebar';

const RootLayout = (): ReactElement => (
  <div className="flex h-screen flex-col">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
  </div>
);

export const Route = createRootRoute({
  component: RootLayout,
});
