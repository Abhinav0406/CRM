'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Percent, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { Sale, Client, Appointment } from '@/lib/api-service';

interface SalesStats {
  totalSales: number;
  totalDeals: number;
  totalCustomers: number;
  conversionRate: number;
  monthlyRevenue: number;
  pendingOrders: number;
}

interface RecentActivity {
  id: number;
  type: 'sale' | 'appointment' | 'customer';
  title: string;
  description: string;
  amount?: number;
  date: string;
}

export default function SalesDashboardPage() {
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalDeals: 0,
    totalCustomers: 0,
    conversionRate: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [topProducts, setTopProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch dashboard data...');
        
        // Fetch sales data
        const salesResponse = await apiService.getSales();
        console.log('Sales API response:', salesResponse);
        
        // Handle different response structures
        let sales: any[] = [];
        if (salesResponse.data) {
          if (Array.isArray(salesResponse.data)) {
            sales = salesResponse.data;
          } else if (typeof salesResponse.data === 'object' && 'results' in salesResponse.data) {
            sales = (salesResponse.data as any).results;
          } else if (typeof salesResponse.data === 'object' && 'data' in salesResponse.data) {
            sales = (salesResponse.data as any).data;
          } else {
            sales = [salesResponse.data];
          }
        }
        console.log('Processed sales data:', sales);
        console.log('Sales count:', sales.length);
        
        // Fetch customers data
        const customersResponse = await apiService.getClients();
        console.log('Customers API response:', customersResponse);
        
        // Handle different response structures
        let customers: any[] = [];
        if (customersResponse.data) {
          if (Array.isArray(customersResponse.data)) {
            customers = customersResponse.data;
          } else if (typeof customersResponse.data === 'object' && 'results' in customersResponse.data) {
            customers = (customersResponse.data as any).results;
          } else if (typeof customersResponse.data === 'object' && 'data' in customersResponse.data) {
            customers = (customersResponse.data as any).data;
          } else {
            customers = [customersResponse.data];
          }
        }
        console.log('Processed customers data:', customers);
        console.log('Customers count:', customers.length);
        
        // Fetch appointments data
        const appointmentsResponse = await apiService.getAppointments();
        console.log('Appointments API response:', appointmentsResponse);
        
        // Handle different response structures
        let appointments: any[] = [];
        if (appointmentsResponse.data) {
          if (Array.isArray(appointmentsResponse.data)) {
            appointments = appointmentsResponse.data;
          } else if (typeof appointmentsResponse.data === 'object' && 'results' in appointmentsResponse.data) {
            appointments = (appointmentsResponse.data as any).results;
          } else if (typeof appointmentsResponse.data === 'object' && 'data' in appointmentsResponse.data) {
            appointments = (appointmentsResponse.data as any).data;
          } else {
            appointments = [appointmentsResponse.data];
          }
        }
        console.log('Processed appointments data:', appointments);
        console.log('Appointments count:', appointments.length);

        // Calculate statistics with additional safety checks
        console.log('Final processed data:', {
          sales: sales,
          salesType: typeof sales,
          salesIsArray: Array.isArray(sales),
          customers: customers,
          customersType: typeof customers,
          customersIsArray: Array.isArray(customers),
          appointments: appointments,
          appointmentsType: typeof appointments,
          appointmentsIsArray: Array.isArray(appointments)
        });

        const totalSales = Array.isArray(sales) ? sales.length : 0;
        const totalCustomers = Array.isArray(customers) ? customers.length : 0;
        
        let monthlyRevenue = 0;
        if (Array.isArray(sales)) {
          try {
            monthlyRevenue = sales.reduce((sum, sale) => {
              const amount = sale?.total_amount || 0;
              return sum + amount;
            }, 0);
          } catch (error) {
            console.error('Error calculating monthly revenue:', error);
            monthlyRevenue = 0;
          }
        }
        
        let pendingOrders = 0;
        if (Array.isArray(sales)) {
          try {
            pendingOrders = sales.filter(sale => sale?.status === 'pending').length;
          } catch (error) {
            console.error('Error calculating pending orders:', error);
            pendingOrders = 0;
          }
        }
        
        const conversionRate = totalCustomers > 0 ? (totalSales / totalCustomers) * 100 : 0;

        console.log('Calculated stats:', {
          totalSales,
          totalCustomers,
          monthlyRevenue,
          pendingOrders,
          conversionRate
        });

        setStats({
          totalSales,
          totalDeals: sales.length,
          totalCustomers,
          conversionRate: Math.round(conversionRate * 100) / 100,
          monthlyRevenue,
          pendingOrders,
        });

        // Prepare recent activities
        const activities: RecentActivity[] = [];
        
        // Add recent sales
        if (Array.isArray(sales)) {
          try {
            sales.slice(0, 5).forEach((sale: any) => {
              activities.push({
                id: sale?.id || 0,
                type: 'sale',
                title: `Sale #${sale?.order_number || 'N/A'}`,
                description: `Order ${sale?.status || 'unknown'}`,
                amount: sale?.total_amount || 0,
                date: sale?.created_at || new Date().toISOString(),
              });
            });
          } catch (error) {
            console.error('Error processing sales for activities:', error);
          }
        }

        // Add recent appointments
        if (Array.isArray(appointments)) {
          try {
            appointments.slice(0, 3).forEach((appointment: any) => {
              activities.push({
                id: appointment?.id || 0,
                type: 'appointment',
                title: `Appointment`,
                description: appointment?.purpose || 'No purpose specified',
                date: appointment?.date || new Date().toISOString(),
              });
            });
          } catch (error) {
            console.error('Error processing appointments for activities:', error);
          }
        }

        // Sort by date and take top 8
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentActivities(activities.slice(0, 8));

        // Mock top products (in real implementation, this would come from backend)
        setTopProducts(['Gold Necklace', 'Diamond Ring', 'Silver Anklet', 'Pearl Earrings']);

        console.log('Dashboard data fetch completed successfully');

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        console.error('Error details:', {
          message: error?.message || 'Unknown error',
          stack: error?.stack || 'No stack trace',
          name: error?.name || 'Unknown error type'
        });
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
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-text-primary">Sales Dashboard</h1>
          <p className="text-text-secondary mt-1">Track your personal sales performance</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="flex flex-row items-center gap-4 p-5 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-text-primary">Sales Dashboard</h1>
        <p className="text-text-secondary mt-1">Track your personal sales performance</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-row items-center gap-4 p-5">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{formatCurrency(stats.monthlyRevenue)}</div>
            <div className="text-sm text-text-secondary font-medium">Monthly Revenue</div>
          </div>
        </Card>
        
        <Card className="flex flex-row items-center gap-4 p-5">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mr-2">
            <ShoppingBag className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{stats.totalDeals}</div>
            <div className="text-sm text-text-secondary font-medium">Total Deals</div>
          </div>
        </Card>
        
        <Card className="flex flex-row items-center gap-4 p-5">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mr-2">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{stats.totalCustomers}</div>
            <div className="text-sm text-text-secondary font-medium">Customers</div>
          </div>
        </Card>
        
        <Card className="flex flex-row items-center gap-4 p-5">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mr-2">
            <Percent className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{stats.conversionRate}%</div>
            <div className="text-sm text-text-secondary font-medium">Conversion Rate</div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Activity
          </div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-text-primary">{activity.title}</div>
                    <div className="text-xs text-text-secondary">{activity.description}</div>
                    {activity.amount && (
                      <div className="text-xs font-medium text-green-600 mt-1">
                        {formatCurrency(activity.amount)}
                      </div>
                    )}
                    <div className="text-xs text-text-secondary mt-1">
                      {formatDate(activity.date)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-text-secondary">No recent activity</div>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="font-semibold mb-4">Top Products</div>
          <div className="space-y-2">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-text-primary">{product}</span>
                <span className="text-xs text-text-secondary">#{index + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
