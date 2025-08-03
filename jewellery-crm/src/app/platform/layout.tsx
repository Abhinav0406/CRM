'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Header } from '@/components/layouts/Header';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { AuthWrapper } from '@/components/auth/AuthWrapper';

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthWrapper requiredRole="platform_admin">
      <div className="main-layout">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="sidebar">
            <Sidebar role="platform_admin" />
          </aside>
        )}
        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar role="platform_admin" />
            </SheetContent>
          </Sheet>
        )}
        <header style={{ gridArea: 'header' }}>
          <Header showSidebarToggle={isMobile} onSidebarToggle={() => setSidebarOpen(true)} />
        </header>
        <main className="main-content">
          {children}
        </main>
      </div>
    </AuthWrapper>
  );
}
