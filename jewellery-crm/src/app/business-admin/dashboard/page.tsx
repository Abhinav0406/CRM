'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api-service';
import { Users, TrendingUp, Package, DollarSign, Calendar, ShoppingBag, Loader2, Target, Store, Award } from 'lucide-react';
import { NotificationBell } from '@/components/notifications';

interface DashboardData {
  // KPI Metrics
  total_sales: {
    today: number;
    week: number;
    month: number;
    today_count: number;
    week_count: number;
    month_count: number;
  };
  pipeline_revenue: number;
  closed_won_pipeline_count: number; // Moved from pipeline to sales
  pipeline_deals_count: number;
  
  // Store Performance
  store_performance: Array<{
    id: number;
    name: string;
    revenue: number;
    closed_won_revenue: number;
  }>;
  
  // Top Performers
  top_managers: Array<{
    id: number;
    name: string;
    revenue: number;
    deals_closed: number;
    avatar?: string;
  }>;
  
  top_salesmen: Array<{
    id: number;
    name: string;
    revenue: number;
    deals_closed: number;
    avatar?: string;
  }>;
}

export default function BusinessAdminDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getBusinessAdminDashboard();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'business_admin':
        return 'Business Admin';
      case 'manager':
        return 'Manager';
      case 'inhouse_sales':
        return 'In-house Sales';
      default:
        return 'User';
    }
  };

  const getScopeDescription = () => {
    switch (user?.role) {
      case 'business_admin':
        return 'All combined data across all stores';
      case 'manager':
        return `Data for ${user?.store_name || 'your store'}`;
      case 'inhouse_sales':
        return `Data for ${user?.store_name || 'your store'}`;
      default:
        return 'Your data';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load dashboard data'}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Business Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Welcome back, {user?.first_name || user?.username || 'Admin'}! Here's your business overview.
          </p>
          <p className="text-sm text-text-secondary mt-1">
            <span className="font-medium">{getRoleDisplayName()}</span> • {getScopeDescription()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Top Row - Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Sales</p>
                <p className="text-lg font-bold text-text-primary">
                  {formatCurrency(dashboardData.total_sales.month)}
                </p>
                <p className="text-xs text-text-secondary">
                  Today: {formatCurrency(dashboardData.total_sales.today)} | 
                  Week: {formatCurrency(dashboardData.total_sales.week)}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  {dashboardData.total_sales.month_count} sales (includes closed won)
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Revenue in Pipeline */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Revenue in Pipeline</p>
                <p className="text-lg font-bold text-text-primary">
                  {formatCurrency(dashboardData.pipeline_revenue)}
                </p>
                <p className="text-xs text-text-secondary">Potential revenue</p>
                <p className="text-xs text-blue-600 font-medium">All combined pending deal - revenue</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Closed Won Pipeline (Moved to Sales) */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Closed Won Pipeline</p>
                <p className="text-lg font-bold text-text-primary">
                  {formatNumber(dashboardData.closed_won_pipeline_count)}
                </p>
                <p className="text-xs text-text-secondary">Successfully closed</p>
                <p className="text-xs text-purple-600 font-medium">All combined deal count: closed won number</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* How Many in Pipeline */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">How Many in Pipeline</p>
                <p className="text-lg font-bold text-text-primary">
                  {formatNumber(dashboardData.pipeline_deals_count)}
                </p>
                <p className="text-xs text-text-secondary">Active deals</p>
                <p className="text-xs text-orange-600 font-medium">All combined deal count: pending deals</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section - Store-wise Performance */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Store-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.store_performance.map((store, index) => (
              <div key={store.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text-primary">{store.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    Store {index + 1}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Total Revenue:</span>
                    <span className="font-medium text-text-primary">
                      {formatCurrency(store.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Closed Won:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(store.closed_won_revenue)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    All combined closed won - Revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section - Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Managers */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top Performing Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.top_managers.length > 0 ? (
                dashboardData.top_managers.map((manager) => (
                  <div key={manager.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{manager.name}</div>
                        <div className="text-xs text-text-secondary">
                          {manager.deals_closed} deals closed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm text-green-600">
                        {formatCurrency(manager.revenue)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No manager data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Salesmen */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top Performing Salesmen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.top_salesmen.length > 0 ? (
                dashboardData.top_salesmen.map((salesman) => (
                  <div key={salesman.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{salesman.name}</div>
                        <div className="text-xs text-text-secondary">
                          {salesman.deals_closed} deals closed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm text-green-600">
                        {formatCurrency(salesman.revenue)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No salesman data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}