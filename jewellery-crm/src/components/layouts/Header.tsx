/**
 * Header Component
 * 
 * Top navigation bar with search, notifications, and user menu.
 * Features HubSpot-inspired design with clean white background.
 * 
 * Key Features:
 * - Global search functionality
 * - Notification center
 * - Quick actions menu
 * - User profile dropdown
 * - Mobile-responsive design
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Search,
  Bell,
  Menu,
  Plus,
  MessageSquare,
  Calendar,
  Users,
  Package,
  Settings,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
  className?: string;
}

/**
 * Quick action items for the plus menu
 */
const quickActions = [
  {
    title: 'Add Customer',
    href: '/customers/new',
    icon: Users,
    description: 'Create a new customer profile',
  },
  {
    title: 'Book Appointment',
    href: '/appointments/new',
    icon: Calendar,
    description: 'Schedule an appointment',
  },
  {
    title: 'Add Product',
    href: '/products/new',
    icon: Package,
    description: 'Add new product to catalog',
  },
  {
    title: 'Send WhatsApp',
    href: '/whatsapp/compose',
    icon: MessageSquare,
    description: 'Send WhatsApp message',
  },
];

/**
 * Mock notifications data
 */
const notifications = [
  {
    id: '1',
    title: 'New appointment booked',
    message: 'Priya Sharma booked an appointment for tomorrow at 2 PM',
    time: '5 minutes ago',
    isRead: false,
    type: 'appointment',
  },
  {
    id: '2',
    title: 'Order ready for delivery',
    message: 'Order #ORD-2024-001 is ready for delivery',
    time: '1 hour ago',
    isRead: false,
    type: 'order',
  },
  {
    id: '3',
    title: 'Low stock alert',
    message: 'Gold rings are running low on stock',
    time: '2 hours ago',
    isRead: true,
    type: 'inventory',
  },
  {
    id: '4',
    title: 'New customer registered',
    message: 'Amit Patel registered as a new customer',
    time: '3 hours ago',
    isRead: true,
    type: 'customer',
  },
];

/**
 * Header Component
 * 
 * Renders the top navigation bar with search, actions, and user menu.
 */
export function Header({ 
  onSidebarToggle, 
  showSidebarToggle = false, 
  className 
}: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user, logout } = useAuth();

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  /**
   * Handle search submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  /**
   * Handle search input changes
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      'border-b border-border',
      className
    )}>
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Sidebar Toggle */}
          {showSidebarToggle && (
            <Button
              id="sidebar-toggle"
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className={cn(
              'relative flex items-center',
              'w-64 lg:w-80 xl:w-96',
              isSearchFocused && 'z-50'
            )}>
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers, products, orders..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  'pl-10 pr-4 py-2 w-full',
                  'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                  'transition-all duration-200'
                )}
              />
            </div>

            {/* Search Suggestions (when focused) */}
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50">
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Quick Actions
                  </div>
                  <div className="space-y-1">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm">
                      Search for &ldquo;{searchQuery}&rdquo; in customers
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm">
                      Search for &ldquo;{searchQuery}&rdquo; in products
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm">
                      Search for &ldquo;{searchQuery}&rdquo; in orders
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Quick Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Quick actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => (
                <DropdownMenuItem key={action.href} asChild>
                  <a href={action.href} className="flex items-start space-x-3 p-3">
                    <action.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="space-y-1">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-0">
                      <div className={cn(
                        'w-full p-3 space-y-1 cursor-pointer',
                        !notification.isRead && 'bg-accent/50'
                      )}>
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm">
                            {notification.title}
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {notification.message}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {notification.time}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center py-3">
                    <a href="/notifications" className="text-sm font-medium">
                      View all notifications
                    </a>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Help</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Help Center
              </DropdownMenuItem>
              <DropdownMenuItem>
                Keyboard Shortcuts
              </DropdownMenuItem>
              <DropdownMenuItem>
                Contact Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Report a Bug
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Business Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}