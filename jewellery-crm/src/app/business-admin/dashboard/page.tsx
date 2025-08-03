'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api-service';
import { Users, TrendingUp, Package, DollarSign, Calendar, ShoppingBag, Loader2, Target } from 'lucide-react';

interface DashboardData {
  metrics: {
    total_sales: number;
    sales_count: number;
    active_customers: number;
    total_products: number;
    team_members: number;
    sales_growth: number;
  };
  pipeline: {
    leads: number;
    qualified: number;
    proposals: number;
    negotiations: number;
    closed: number;
  };
  recent_sales: Array<{
    id: number;
    client_name: string;
    amount: number;
    status: string;
    date: string;
    items_count: number;
  }>;
  recent_activities: Array<{
    type: string;
    title: string;
    description: string;
    date: string;
    amount?: number;
  }>;
  period: {
    start_date: string;
    end_date: string;
  };
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return ShoppingBag;
      case 'pipeline':
        return Target;
      case 'customer':
        return Users;
      default:
        return Users;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-green-100 text-green-600';
      case 'pipeline':
        return 'bg-blue-100 text-blue-600';
      case 'customer':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
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
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Welcome back, {user?.first_name || user?.username || 'Admin'}! Here's what's happening with your business.
          </p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Sales</p>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(dashboardData.metrics.total_sales)}</p>
                <p className="text-xs text-text-secondary">
                  {dashboardData.metrics.sales_count} transactions
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Active Customers</p>
                <p className="text-2xl font-bold text-text-primary">{formatNumber(dashboardData.metrics.active_customers)}</p>
                <p className="text-xs text-text-secondary">
                  {dashboardData.metrics.sales_growth > 0 ? '+' : ''}{dashboardData.metrics.sales_growth}% growth
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Products</p>
                <p className="text-2xl font-bold text-text-primary">{formatNumber(dashboardData.metrics.total_products)}</p>
                <p className="text-xs text-text-secondary">In inventory</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Team Members</p>
                <p className="text-2xl font-bold text-text-primary">{formatNumber(dashboardData.metrics.team_members)}</p>
                <p className="text-xs text-text-secondary">Active staff</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Leads</span>
                <Badge variant="outline">{dashboardData.pipeline.leads}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Qualified</span>
                <Badge variant="outline">{dashboardData.pipeline.qualified}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Proposals</span>
                <Badge variant="outline">{dashboardData.pipeline.proposals}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Negotiations</span>
                <Badge variant="outline">{dashboardData.pipeline.negotiations}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Closed</span>
                <Badge variant="outline">{dashboardData.pipeline.closed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recent_sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{sale.client_name}</div>
                    <div className="text-xs text-text-secondary">{sale.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{formatCurrency(sale.amount)}</div>
                    <Badge variant="outline" className="text-xs">{sale.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recent_activities.slice(0, 10).map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{activity.title}</div>
                    <div className="text-xs text-text-secondary">{activity.description}</div>
                    <div className="text-xs text-text-secondary mt-1">{activity.date}</div>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <div className="font-medium text-sm">{formatCurrency(activity.amount)}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}