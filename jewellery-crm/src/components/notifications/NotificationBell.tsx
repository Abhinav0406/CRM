'use client';

import React, { useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/types';
import { NotificationPanel } from './NotificationPanel';

interface NotificationBellProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  variant = 'ghost',
  size = 'md'
}) => {
  const { state } = useNotifications();
  const { user, isAuthenticated, isHydrated } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  console.log('🔔 NotificationBell render:', { 
    user: user?.username, 
    isAuthenticated, 
    isHydrated, 
    notificationsCount: state.notifications.length,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error
  });

  // Filter notifications based on user role and store access (same logic as NotificationManager)
  const getScopedNotifications = (notifications: Notification[]) => {
    console.log('🔍 getScopedNotifications called with:', { 
      notificationsCount: notifications.length,
      user: user?.username,
      userId: user?.id,
      userRole: user?.role,
      userTenant: user?.tenant,
      userStore: user?.store
    });

    if (!user) {
      console.log('❌ No user, returning empty array');
      return [];
    }

    // Business admin can see all notifications
    if (user.role === 'business_admin') {
      console.log('✅ Business admin - returning all notifications');
      return notifications;
    }

    // Manager can see their store's notifications
    if (user.role === 'manager') {
      const filtered = notifications.filter(notification => 
        notification.tenantId === user.tenant?.toString() &&
        (!notification.storeId || notification.storeId === user.store?.toString())
      );
      console.log('✅ Manager - filtered notifications:', { 
        total: notifications.length, 
        filtered: filtered.length,
        userTenant: user.tenant?.toString(),
        userStore: user.store?.toString()
      });
      return filtered;
    }

    // Inhouse sales can see their own notifications
    if (user.role === 'inhouse_sales') {
      const filtered = notifications.filter(notification => 
        notification.userId === user.id.toString()
      );
      console.log('✅ Inhouse sales - filtered notifications:', { 
        total: notifications.length, 
        filtered: filtered.length,
        userId: user.id.toString(),
        notificationUserIds: notifications.map(n => n.userId)
      });
      return filtered;
    }

    // Telecaller can see their assigned notifications
    if (user.role === 'tele_calling') {
      const filtered = notifications.filter(notification => 
        notification.userId === user.id.toString() ||
        notification.tenantId === user.tenant?.toString()
      );
      console.log('✅ Telecaller - filtered notifications:', { 
        total: notifications.length, 
        filtered: filtered.length 
      });
      return filtered;
    }

    // Marketing team can see marketing-related notifications
    if (user.role === 'marketing') {
      const filtered = notifications.filter(notification => 
        notification.type === 'marketing_campaign' ||
        notification.type === 'announcement'
      );
      console.log('✅ Marketing - filtered notifications:', { 
        total: notifications.length, 
        filtered: filtered.length 
      });
      return filtered;
    }

    // Default: only show user's own notifications
    const filtered = notifications.filter(notification => 
      notification.userId === user.id.toString()
    );
    console.log('✅ Default - filtered notifications:', { 
      total: notifications.length, 
      filtered: filtered.length 
    });
    return filtered;
  };

  // Don't render if user is not authenticated
  if (!isAuthenticated || !isHydrated || !user) {
    console.log('❌ NotificationBell: Not rendering - not authenticated or not hydrated');
    return null;
  }

  // Get scoped unread count
  const scopedNotifications = getScopedNotifications(state.notifications);
  const unreadCount = scopedNotifications.filter(n => n.status === 'unread').length;

  console.log('✅ NotificationBell: Rendering with', { 
    scopedNotificationsCount: scopedNotifications.length,
    unreadCount,
    userRole: user.role
  });

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 20;
      default:
        return 18;
    }
  };

  const handleBellClick = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size="icon"
        className={`relative ${getSizeClasses()} ${className}`}
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        {state.isLoading ? (
          <Loader2 className={`h-${getIconSize()} w-${getIconSize()} animate-spin`} />
        ) : state.isConnected ? (
          <Bell className={`h-${getIconSize()} w-${getIconSize()}`} />
        ) : (
          <BellOff className={`h-${getIconSize()} w-${getIconSize()} text-muted-foreground`} />
        )}
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification panel */}
      {isPanelOpen && (
        <NotificationPanel onClose={handlePanelClose} />
      )}
    </div>
  );
}; 