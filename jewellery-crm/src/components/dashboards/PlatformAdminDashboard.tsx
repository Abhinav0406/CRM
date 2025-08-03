/**
 * Platform Admin Dashboard Component
 * 
 * System-wide overview for platform administrators managing multiple tenants.
 * Features tenant management, billing overview, and system analytics.
 * 
 * Key Features:
 * - Multi-tenant overview and metrics
 * - Billing and subscription management
 * - System performance analytics
 * - User management across tenants
 * - Platform-wide statistics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DashboardLayout, 
  CardContainer,
} from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  Users, 
  CreditCard,
  TrendingUp,
  Database,
  Shield,
  Globe,
  AlertTriangle,
  Plus,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Loader2,
} from 'lucide-react';
import { apiService } from '@/lib/api-service';

interface PlatformMetrics {
  total_tenants: number;
  active_tenants: number;
  total_users: number;
  total_sales: {
    amount: number;
    count: number;
  };
  recent_tenants: Array<{
    id: number;
    name: string;
    business_type: string;
    subscription_status: string;
    created_at: string;
    user_count: number;
  }>;
  system_health: {
    uptime: string;
    active_subscriptions: number;
    total_revenue: number;
    support_tickets: number;
  };
}

/**
 * Platform Admin Dashboard Component
 */
export function PlatformAdminDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getPlatformAdminDashboard();
        
        if (response.success && response.data) {
          setMetrics(response.data);
        } else {
          setError('Failed to fetch platform data');
        }
      } catch (err) {
        console.error('Error fetching platform data:', err);
        setError('Failed to load platform dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformData();
  }, []);

  // Navigation handlers
  const handleAddTenant = () => {
    router.push('/platform/tenants/new');
  };

  const handleViewAllTenants = () => {
    router.push('/platform/tenants');
  };

  const handleSystemSettings = () => {
    router.push('/platform/settings');
  };

  const handleManageUsers = () => {
    router.push('/platform/users');
  };

  const handleBillingOverview = () => {
    router.push('/platform/billing');
  };

  const handleDetailedReport = () => {
    router.push('/platform/analytics');
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Platform Overview"
        subtitle="Monitor system performance and manage all tenant businesses"
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading platform data...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Platform Overview"
        subtitle="Monitor system performance and manage all tenant businesses"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Error loading platform data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!metrics) {
    return (
      <DashboardLayout
        title="Platform Overview"
        subtitle="Monitor system performance and manage all tenant businesses"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No platform data available</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Platform Overview"
      subtitle="Monitor system performance and manage all tenant businesses"
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSystemSettings}>
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
          <Button size="sm" onClick={handleAddTenant}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      }
    >
      {/* Platform Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Tenants */}
        <CardContainer className="border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
              <p className="text-3xl font-bold text-foreground">{metrics.total_tenants}</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="text-green-600 font-medium">{metrics.active_tenants} active</span>
              </p>
            </div>
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        </CardContainer>

        {/* Total Users */}
        <CardContainer className="border-l-4 border-l-navy-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Platform Users</p>
              <p className="text-3xl font-bold text-foreground">{metrics.total_users.toLocaleString()}</p>
              <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Active across all tenants
              </p>
            </div>
            <Users className="h-8 w-8 text-navy-500" />
          </div>
        </CardContainer>

        {/* Monthly Revenue */}
        <CardContainer className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales (30 days)</p>
              <p className="text-3xl font-bold text-foreground flex items-center">
                <IndianRupee className="w-6 h-6 mr-1" />
                {(metrics.total_sales.amount / 100000).toFixed(1)}L
              </p>
              <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {metrics.total_sales.count} transactions
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-green-500" />
          </div>
        </CardContainer>

        {/* System Health */}
        <CardContainer className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
              <p className="text-3xl font-bold text-foreground">{metrics.system_health.uptime}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {metrics.system_health.active_subscriptions} active subscriptions
              </p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </CardContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tenant Management */}
        <CardContainer>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Recent Tenants</h3>
              <p className="text-sm text-muted-foreground">Latest businesses joined the platform</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewAllTenants}>
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {metrics.recent_tenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tenant.name}</p>
                    <p className="text-sm text-muted-foreground">{tenant.business_type} • {tenant.user_count} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={tenant.subscription_status === 'active' ? 'default' : 'secondary'}>
                    {tenant.subscription_status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Joined {tenant.created_at}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContainer>

        {/* System Analytics */}
        <CardContainer>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">System Analytics</h3>
              <p className="text-sm text-muted-foreground">Platform performance metrics</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDetailedReport}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Detailed Report
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-foreground">Total Revenue</p>
                  <p className="text-sm text-muted-foreground">Platform-wide revenue</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  ₹{(metrics.system_health.total_revenue / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-foreground">Active Subscriptions</p>
                  <p className="text-sm text-muted-foreground">Paying tenants</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{metrics.system_health.active_subscriptions}</p>
                <p className="text-xs text-green-600">Active tenants</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-foreground">Support Tickets</p>
                  <p className="text-sm text-muted-foreground">Requires attention</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-yellow-600">{metrics.system_health.support_tickets}</p>
                <p className="text-xs text-muted-foreground">Open tickets</p>
              </div>
            </div>
          </div>
        </CardContainer>
      </div>

      {/* Quick Actions */}
      <CardContainer>
        <h3 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex-col space-y-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={handleAddTenant}
          >
            <Plus className="w-5 h-5" />
            <span>Add Tenant</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col space-y-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={handleManageUsers}
          >
            <Users className="w-5 h-5" />
            <span>Manage Users</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col space-y-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={handleBillingOverview}
          >
            <CreditCard className="w-5 h-5" />
            <span>Billing Overview</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col space-y-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={handleSystemSettings}
          >
            <Settings className="w-5 h-5" />
            <span>System Settings</span>
          </Button>
        </div>
      </CardContainer>
    </DashboardLayout>
  );
}