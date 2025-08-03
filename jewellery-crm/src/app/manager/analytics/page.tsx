'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart2, PieChart, TrendingUp, Users, Percent, Activity } from 'lucide-react';
import { apiService } from '@/lib/api-service';

interface AnalyticsStats {
  revenue: number;
  orders: number;
  customers: number;
  conversion_rate: number;
}

interface RecentActivity {
  id: string;
  label: string;
  date: string;
  type: string;
}

export default function ManagerAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>({
    revenue: 0,
    orders: 0,
    customers: 0,
    conversion_rate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls when analytics endpoints are implemented
      // const statsResponse = await apiService.getAnalyticsStats();
      // const activityResponse = await apiService.getRecentActivity();
      // 
      // if (statsResponse.success) {
      //   setStats(statsResponse.data);
      // }
      // if (activityResponse.success) {
      //   setRecentActivity(activityResponse.data);
      // }
      
      // For now, show empty state
      setStats({
        revenue: 0,
        orders: 0,
        customers: 0,
        conversion_rate: 0,
      });
      setRecentActivity([]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-text-primary">Analytics</h1>
        <p className="text-text-secondary mt-1">Track your store's performance and key metrics</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-row items-center gap-4 p-5">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mr-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{formatCurrency(stats.revenue)}</div>
            <div className="text-sm text-text-secondary font-medium">Revenue</div>
          </div>
        </Card>
        
        <Card className="flex flex-row items-center gap-4 p-5">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mr-2">
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{stats.orders}</div>
            <div className="text-sm text-text-secondary font-medium">Orders</div>
          </div>
        </Card>
        
        <Card className="flex flex-row items-center gap-4 p-5">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mr-2">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{stats.customers}</div>
            <div className="text-sm text-text-secondary font-medium">Customers</div>
          </div>
        </Card>
        
        <Card className="flex flex-row items-center gap-4 p-5">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mr-2">
            <Percent className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{stats.conversion_rate.toFixed(1)}%</div>
            <div className="text-sm text-text-secondary font-medium">Conversion Rate</div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col gap-2 p-6 items-center justify-center min-h-[220px]">
          <BarChart2 className="w-12 h-12 text-blue-400 mb-2" />
          <div className="font-semibold text-text-primary">Sales Over Time</div>
          <div className="text-xs text-text-muted">No data available</div>
        </Card>
        <Card className="flex flex-col gap-2 p-6 items-center justify-center min-h-[220px]">
          <PieChart className="w-12 h-12 text-purple-400 mb-2" />
          <div className="font-semibold text-text-primary">Top Products</div>
          <div className="text-xs text-text-muted">No data available</div>
        </Card>
      </div>
      
      <Card className="p-6">
        <div className="font-semibold text-text-primary mb-2">Recent Activity</div>
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Activity className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-500 text-center">No recent activity</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="py-2 flex items-center justify-between">
                <span className="text-text-secondary">{activity.label}</span>
                <span className="text-xs text-text-muted">{formatDate(activity.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
