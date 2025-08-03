'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiService, SalesPipeline } from '@/lib/api-service';
import { AddDealModal } from '@/components/pipeline/AddDealModal';
import { DealDetailModal } from '@/components/pipeline/DealDetailModal';
import { Plus, TrendingUp, Users, DollarSign, Calendar, Search, Filter, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PipelineStats {
  totalValue: number;
  activeDeals: number;
  conversionRate: number;
  avgDealSize: number;
}

interface PipelineStage {
  label: string;
  value: number;
  count: number;
  color: string;
}

export default function SalesPipelinePage() {
  const { user } = useAuth();
  const [pipelines, setPipelines] = useState<SalesPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDealModalOpen, setAddDealModalOpen] = useState(false);
  const [dealDetailModalOpen, setDealDetailModalOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [stats, setStats] = useState<PipelineStats>({
    totalValue: 0,
    activeDeals: 0,
    conversionRate: 0,
    avgDealSize: 0,
  });
  const [stages, setStages] = useState<PipelineStage[]>([]);
  
  console.log('Current user:', user);
  console.log('User tenant:', user?.tenant);

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [pipelines]);

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      console.log('Fetching pipelines...');
      const response = await apiService.getSalesPipeline();
      console.log('Pipeline API response:', response);
      
      // Handle different response structures
      let pipelinesData: SalesPipeline[] = [];
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          pipelinesData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          const data = response.data as any;
          if (data.results && Array.isArray(data.results)) {
            pipelinesData = data.results;
          } else if (data.data && Array.isArray(data.data)) {
            pipelinesData = data.data;
          }
        }
      }
      
      console.log('Processed pipelines data:', pipelinesData);
      console.log('Number of pipelines:', pipelinesData.length);
      
      setPipelines(pipelinesData);
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      setPipelines([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const pipelinesArray = pipelines || [];
    console.log('Calculating stats for pipelines:', pipelinesArray);
    
    const activePipelines = pipelinesArray.filter(p => p.stage !== 'closed_lost');
    const totalValue = activePipelines.reduce((sum, p) => {
      const value = p.expected_value;
      // Handle all possible null/undefined/NaN cases
      if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
        console.log('Skipping invalid expected_value:', value, 'for pipeline:', p.title);
        return sum;
      }
      const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      console.log('Adding value:', numericValue, 'for pipeline:', p.title);
      return sum + numericValue;
    }, 0);
    
    const activeDeals = activePipelines.length;
    const wonDeals = pipelinesArray.filter(p => p.stage === 'closed_won').length;
    const conversionRate = pipelinesArray.length > 0 ? (wonDeals / pipelinesArray.length) * 100 : 0;
    const avgDealSize = activeDeals > 0 ? totalValue / activeDeals : 0;

    console.log('Calculated stats:', {
      totalValue,
      activeDeals,
      conversionRate,
      avgDealSize,
      pipelineCount: pipelinesArray.length
    });

    setStats({
      totalValue,
      activeDeals,
      conversionRate,
      avgDealSize,
    });

    // Calculate stage breakdown
    const stageData = [
      { stage: 'lead', label: 'Lead', color: 'bg-gray-500' },
      { stage: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
      { stage: 'qualified', label: 'Qualified', color: 'bg-yellow-500' },
      { stage: 'proposal', label: 'Proposal', color: 'bg-orange-500' },
      { stage: 'negotiation', label: 'Negotiation', color: 'bg-purple-500' },
      { stage: 'closed_won', label: 'Closed Won', color: 'bg-green-500' },
      { stage: 'closed_lost', label: 'Closed Lost', color: 'bg-red-500' },
    ];

    const stageStats = stageData.map(({ stage, label, color }) => {
      const stagePipelines = pipelinesArray.filter(p => p.stage === stage);
      const value = stagePipelines.reduce((sum, p) => {
        const val = p.expected_value;
        // Handle all possible null/undefined/NaN cases
        if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
          return sum;
        }
        return sum + (typeof val === 'number' ? val : parseFloat(val) || 0);
      }, 0);
      return {
        label,
        value,
        count: stagePipelines.length,
        color,
      };
    });

    setStages(stageStats);
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
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleAddDeal = () => {
    setAddDealModalOpen(true);
  };

  const handleDealCreated = () => {
    fetchPipelines(); // Refresh the list
  };

  const handleViewDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    setDealDetailModalOpen(true);
  };

  const handleDealUpdated = () => {
    fetchPipelines(); // Refresh the list
  };

  const getFilteredPipelines = () => {
    let filtered = pipelines;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by stage
    if (selectedStage !== 'all') {
      filtered = filtered.filter(p => p.stage === selectedStage);
    }

    return filtered;
  };

  const getRecentPipelines = () => {
    return getFilteredPipelines()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  };

  const getUpcomingActions = () => {
    return getFilteredPipelines()
      .filter(p => p.next_action_date && new Date(p.next_action_date) > new Date())
      .sort((a, b) => new Date(a.next_action_date!).getTime() - new Date(b.next_action_date!).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Sales Pipeline</h1>
            <p className="text-text-secondary mt-1">Manage your personal sales deals</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="flex flex-col gap-1 p-5 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Sales Pipeline</h1>
          <p className="text-text-secondary mt-1">Manage your personal sales deals</p>
        </div>
        <Button className="btn-primary" onClick={handleAddDeal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers, products, orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stages</option>
              <option value="lead">Lead</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col gap-1 p-5">
          <div className="text-xl font-bold text-text-primary">{formatCurrency(stats.totalValue)}</div>
          <div className="text-sm text-text-secondary font-medium">Total Value</div>
          <div className="text-xs text-text-muted mt-1">{stats.activeDeals} active deals</div>
        </Card>
        <Card className="flex flex-col gap-1 p-5">
          <div className="text-xl font-bold text-text-primary">{stats.activeDeals}</div>
          <div className="text-sm text-text-secondary font-medium">Active Deals</div>
          <div className="text-xs text-text-muted mt-1">Total active pipelines</div>
        </Card>
        <Card className="flex flex-col gap-1 p-5">
          <div className="text-xl font-bold text-text-primary">{stats.conversionRate.toFixed(1)}%</div>
          <div className="text-sm text-text-secondary font-medium">Conversion Rate</div>
          <div className="text-xs text-text-muted mt-1">Win rate</div>
        </Card>
        <Card className="flex flex-col gap-1 p-5">
          <div className="text-xl font-bold text-text-primary">{formatCurrency(stats.avgDealSize)}</div>
          <div className="text-sm text-text-secondary font-medium">Avg Deal Size</div>
          <div className="text-xs text-text-muted mt-1">Average deal value</div>
        </Card>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Pipeline Stages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {stages.map((stage) => (
            <Card key={stage.label} className="flex flex-col gap-1 p-4 items-start">
              <div className="flex items-center gap-2 w-full">
                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                <div className="font-semibold text-text-primary">{stage.label}</div>
              </div>
              <div className="text-lg font-bold text-text-primary">{formatCurrency(stage.value)}</div>
              <div className="text-xs text-text-muted">{stage.count} deals</div>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-4 text-text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recent Pipelines
          </h3>
          <div className="space-y-3">
            {getRecentPipelines().length > 0 ? (
              getRecentPipelines().map((pipeline) => (
                <div key={pipeline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => handleViewDeal(pipeline.id.toString())}>
                  <div>
                    <div className="font-medium text-sm text-text-primary">{pipeline.title}</div>
                    <div className="text-xs text-text-secondary">
                      {pipeline.client ? `Client #${pipeline.client}` : 'No client'}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {formatCurrency(pipeline.expected_value)}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {pipeline.stage}
                      </Badge>
                    </div>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-text-muted text-sm">No recent pipelines.</div>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-4 text-text-primary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Actions
          </h3>
          <div className="space-y-3">
            {getUpcomingActions().length > 0 ? (
              getUpcomingActions().map((pipeline) => (
                <div key={pipeline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-text-primary">{pipeline.next_action}</div>
                    <div className="text-xs text-text-secondary">
                      {pipeline.next_action_date ? formatDate(pipeline.next_action_date) : 'No date'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-primary">{pipeline.title}</div>
                    <div className="text-xs text-text-secondary">
                      {formatCurrency(pipeline.expected_value)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-text-muted text-sm">No upcoming actions.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Add Deal Modal */}
      <AddDealModal 
        open={addDealModalOpen} 
        onClose={() => setAddDealModalOpen(false)}
        onDealCreated={handleDealCreated}
      />

      {/* Deal Detail Modal */}
      <DealDetailModal 
        open={dealDetailModalOpen} 
        onClose={() => {
          setDealDetailModalOpen(false);
          setSelectedDealId(null);
        }}
        dealId={selectedDealId}
        onDealUpdated={handleDealUpdated}
      />
    </div>
  );
}