'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, Filter, MoreHorizontal, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { apiService } from '@/lib/api-service';

interface PipelineDeal {
  id: number;
  title: string;
  client: number | { id: number; first_name: string; last_name: string; full_name?: string };
  sales_representative: number;
  stage: string;
  probability: number;
  expected_value: number;
  actual_value: number;
  expected_close_date?: string;
  actual_close_date?: string;
  notes?: string;
  next_action?: string;
  next_action_date?: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

interface PipelineStats {
  total_deals: number;
  total_value: number;
  won_deals: number;
  conversion_rate: number;
}

const pipelineStages = [
  { name: 'Lead', value: 'lead', color: 'bg-gray-100 text-gray-800' },
  { name: 'Qualified', value: 'qualified', color: 'bg-blue-100 text-blue-800' },
  { name: 'Proposal', value: 'proposal', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Negotiation', value: 'negotiation', color: 'bg-orange-100 text-orange-800' },
  { name: 'Closed Won', value: 'closed_won', color: 'bg-green-100 text-green-800' },
  { name: 'Closed Lost', value: 'closed_lost', color: 'bg-red-100 text-red-800' },
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<PipelineDeal[]>([]);
  const [stats, setStats] = useState<PipelineStats>({
    total_deals: 0,
    total_value: 0,
    won_deals: 0,
    conversion_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  useEffect(() => {
    fetchPipelineData();
  }, [searchTerm, stageFilter]);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSalesPipeline({
        stage: stageFilter || undefined,
      });
      
      if (response.success) {
        const data = response.data as any;
        const dealsData = Array.isArray(data) ? data : data.results || [];
        
        // Debug the data
        console.log('Pipeline data received:', dealsData);
        
        setDeals(dealsData);
        
        // Calculate stats from deals with comprehensive null checking
        const totalDeals = dealsData.length;
        const totalValue = dealsData.reduce((sum: number, deal: PipelineDeal) => {
          const value = deal.expected_value;
          // Handle all possible null/undefined/NaN cases
          if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
            return sum;
          }
          return sum + (typeof value === 'number' ? value : parseFloat(value) || 0);
        }, 0);
        
        const wonDeals = dealsData.filter((deal: PipelineDeal) => deal.stage === 'closed_won').length;
        const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
        
        console.log('Calculated stats:', {
          totalDeals,
          totalValue,
          wonDeals,
          conversionRate
        });
        
        setStats({
          total_deals: totalDeals,
          total_value: totalValue,
          won_deals: wonDeals,
          conversion_rate: conversionRate,
        });
      }
    } catch (error) {
      console.error('Failed to fetch pipeline data:', error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    const stageConfig = pipelineStages.find(s => s.value === stage);
    return stageConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    // Handle NaN and invalid numbers
    if (!amount || isNaN(amount) || !isFinite(amount)) {
      return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDealsByStage = (stage: string) => {
    return deals.filter(deal => deal.stage === stage);
  };

  // Helper function to safely check if a date is in the future
  const isFutureDate = (dateString?: string): boolean => {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  };

  // Helper function to safely format date with null check
  const safeFormatDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';
    return formatDate(dateString);
  };

  // Helper function to get client display name
  const getClientDisplay = (client: number | { id: number; first_name: string; last_name: string; full_name?: string }): string => {
    if (!client) return 'Unknown Client';
    
    // Debug client data
    console.log('Client data:', client, 'Type:', typeof client);
    
    if (typeof client === 'number') {
      return `Client ${client}`;
    }
    
    // Handle case where client is an object but properties are undefined
    if (client.full_name) {
      return client.full_name;
    }
    if (client.first_name && client.last_name) {
      return `${client.first_name} ${client.last_name}`;
    }
    if (client.first_name) {
      return client.first_name;
    }
    if (client.id) {
      return `Client ${client.id}`;
    }
    
    // If we get here, log the client object for debugging
    console.warn('Unexpected client format:', client);
    return 'Unknown Client';
  };

  // Helper function to get client ID
  const getClientId = (client: number | { id: number; first_name: string; last_name: string; full_name?: string }): number => {
    if (typeof client === 'number') {
      return client;
    }
    return client?.id || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Sales Pipeline</h1>
          <p className="text-text-secondary mt-1">Track and manage your sales opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Deals</p>
                <p className="text-2xl font-bold text-text-primary">{stats.total_deals}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Value</p>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(stats.total_value)}</p>
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
                <p className="text-sm font-medium text-text-secondary">Won Deals</p>
                <p className="text-2xl font-bold text-text-primary">{stats.won_deals}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Conversion Rate</p>
                <p className="text-2xl font-bold text-text-primary">{stats.conversion_rate.toFixed(1)}%</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {pipelineStages.map((stage) => {
          const stageDeals = getDealsByStage(stage.value);
          const stageValue = stageDeals.reduce((sum, deal) => {
            const value = deal.expected_value;
            // Handle all possible null/undefined/NaN cases
            if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
              return sum;
            }
            return sum + (typeof value === 'number' ? value : parseFloat(value) || 0);
          }, 0);
          
          return (
            <Card key={stage.value} className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{stage.name}</span>
                  <Badge variant="outline" className={stage.color}>
                    {stageDeals.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-text-primary">{deal.title}</h4>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                                              <div className="space-y-1 text-xs text-text-secondary">
                          <p>Client: {getClientDisplay(deal.client)}</p>
                          <p>{formatCurrency(deal.expected_value)}</p>
                          <p>Probability: {deal.probability}%</p>
                          <p>Expected: {safeFormatDate(deal.expected_close_date)}</p>
                        </div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 text-text-secondary text-sm">
                      No deals in this stage
                    </div>
                  )}
                </div>
                {stageDeals.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-xs text-text-secondary">Stage Value: {formatCurrency(stageValue)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Pipeline Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Pipeline Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-text-secondary">Loading activity...</div>
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-text-secondary mb-2">No pipeline activity</div>
              <Button variant="outline">
                Add your first deal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {deals.slice(0, 5).map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStageColor(deal.stage).split(' ')[0]}`}></div>
                    <div>
                      <div className="font-medium text-text-primary">{deal.title}</div>
                      <div className="text-sm text-text-secondary">
                        {getClientDisplay(deal.client)} • {formatCurrency(deal.expected_value)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStageColor(deal.stage)}>
                      {deal.stage.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-text-secondary mt-1">
                      {safeFormatDate(deal.expected_close_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Upcoming Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deals
              .filter(deal => isFutureDate(deal.expected_close_date))
              .slice(0, 3)
              .map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-text-primary">Follow up with {getClientDisplay(deal.client)}</div>
                    <div className="text-sm text-text-secondary">{deal.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-text-primary">
                      {safeFormatDate(deal.expected_close_date)}
                    </div>
                    <div className="text-xs text-text-secondary">Due soon</div>
                  </div>
                </div>
              ))}
            {deals.filter(deal => isFutureDate(deal.expected_close_date)).length === 0 && (
              <div className="text-center py-4 text-text-secondary">
                No upcoming actions
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}