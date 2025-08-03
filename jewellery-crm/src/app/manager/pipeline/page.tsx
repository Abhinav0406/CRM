'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiService, SalesPipeline } from '@/lib/api-service';

interface PipelineStats {
  totalValue: number;
  activeDeals: number;
  conversionRate: number;
  avgDealSize: number;
}

interface StageData {
  label: string;
  value: number;
  count: number;
}

interface SalesPipeline {
  id: number;
  title: string;
  client: number;
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

export default function ManagerPipelinePage() {
  const [stats, setStats] = useState<PipelineStats>({
    totalValue: 0,
    activeDeals: 0,
    conversionRate: 0,
    avgDealSize: 0,
  });
  const [stages, setStages] = useState<StageData[]>([]);
  const [pipelines, setPipelines] = useState<SalesPipeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      
      // Fetch pipeline statistics
      const statsResponse = await apiService.getPipelineStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Fetch pipeline stages
      const stagesResponse = await apiService.getPipelineStages();
      if (stagesResponse.success && stagesResponse.data) {
        setStages(stagesResponse.data);
      }

      // Fetch recent pipelines
      const pipelinesResponse = await apiService.getSalesPipeline();
      if (pipelinesResponse.success && pipelinesResponse.data) {
        // Handle different response structures
        let pipelinesData: SalesPipeline[] = [];
        if (Array.isArray(pipelinesResponse.data)) {
          pipelinesData = pipelinesResponse.data;
        } else if (typeof pipelinesResponse.data === 'object' && pipelinesResponse.data !== null) {
          const data = pipelinesResponse.data as any;
          if (data.results && Array.isArray(data.results)) {
            pipelinesData = data.results;
          } else if (data.data && Array.isArray(data.data)) {
            pipelinesData = data.data;
          }
        }
        setPipelines(pipelinesData);
      }
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
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
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Sales Pipeline</h1>
          <p className="text-text-secondary mt-1">Manage your sales pipeline and track deal progress.</p>
        </div>
        <Button className="btn-primary">+ Create Pipeline</Button>
      </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex flex-col gap-1 p-5">
            <div className="text-xl font-bold text-text-primary">{formatCurrency(stats?.totalValue || 0)}</div>
            <div className="text-sm text-text-secondary font-medium">Total Pipeline Value</div>
            <div className="text-xs text-text-muted mt-1">{stats?.activeDeals || 0} active deals</div>
          </Card>
          <Card className="flex flex-col gap-1 p-5">
            <div className="text-xl font-bold text-text-primary">{stats?.activeDeals || 0}</div>
            <div className="text-sm text-text-secondary font-medium">Active Deals</div>
            <div className="text-xs text-text-muted mt-1">Total active pipelines</div>
          </Card>
          <Card className="flex flex-col gap-1 p-5">
            <div className="text-xl font-bold text-text-primary">{(stats?.conversionRate || 0).toFixed(1)}%</div>
            <div className="text-sm text-text-secondary font-medium">Conversion Rate</div>
            <div className="text-xs text-text-muted mt-1">Win rate</div>
          </Card>
          <Card className="flex flex-col gap-1 p-5">
            <div className="text-xl font-bold text-text-primary">{formatCurrency(stats?.avgDealSize || 0)}</div>
            <div className="text-sm text-text-secondary font-medium">Avg Deal Size</div>
            <div className="text-xs text-text-muted mt-1">Average deal value</div>
          </Card>
        </div>
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-2 mt-4">Pipeline Stages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {stages && stages.length > 0 ? stages.map((stage) => (
            <Card key={stage.label} className="flex flex-col gap-1 p-4 items-start">
              <div className="font-semibold text-text-primary">{stage.label}</div>
              <div className="text-lg font-bold text-text-primary">{formatCurrency(stage.value)}</div>
              <div className="text-xs text-text-muted">{stage.count} deals</div>
            </Card>
          )) : (
            <div className="col-span-full text-center text-text-muted text-sm">No pipeline stages available.</div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-2 text-text-primary">Recent Pipelines</h3>
          {!pipelines || pipelines.length === 0 ? (
            <div className="text-text-muted text-sm">No recent pipelines.</div>
          ) : (
            <div className="space-y-3">
              {pipelines.slice(0, 5).map((pipeline) => (
                <div key={pipeline.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-text-primary">{pipeline.title}</div>
                    <div className="text-sm text-text-muted">Stage: {pipeline.stage}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-text-primary">{formatCurrency(pipeline.expected_value || 0)}</div>
                    <div className="text-xs text-text-muted">{pipeline.probability || 0}% probability</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-2 text-text-primary">Upcoming Actions</h3>
          <div className="text-text-muted text-sm">No upcoming actions.</div>
        </Card>
      </div>
    </div>
  );
}