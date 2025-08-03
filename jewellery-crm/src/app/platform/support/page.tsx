'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api-service';

interface SupportTicket {
  id: number;
  ticket_id: string;
  title: string;
  summary: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  created_by: number;
  tenant: number;
  assigned_to?: number;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  is_urgent: boolean;
  requires_callback: boolean;
  callback_phone?: string;
  callback_preferred_time?: string;
}

export default function PlatformSupportTicketsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/support/tickets/';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
             const response = await apiService.getSupportTickets({
         search: searchTerm || undefined,
         status: statusFilter === 'all' ? undefined : statusFilter || undefined,
         priority: priorityFilter === 'all' ? undefined : priorityFilter || undefined,
       });
       
       console.log('API Response:', response);
       
       // Ensure tickets is always an array
       if (response.success && response.data) {
         const ticketsData = Array.isArray(response.data) ? response.data : (response.data as any).results || [];
         console.log('Tickets data:', ticketsData);
         setTickets(ticketsData);
       } else {
         console.log('No tickets data, setting empty array');
         setTickets([]);
       }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) {
      return; // Wait for hydration to complete
    }
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'platform_admin') {
      console.log('User is not platform admin, redirecting');
      router.push('/select-role');
      return;
    }
    
    console.log('Platform admin authenticated, fetching tickets:', { user, isAuthenticated });
    fetchTickets();
  }, [searchTerm, statusFilter, priorityFilter, isAuthenticated, user, router, isHydrated]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'closed': return 'secondary';
      case 'open': return 'destructive';
      case 'in_progress': return 'outline';
      case 'reopened': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!isAuthenticated || user?.role !== 'platform_admin') {
    return <div>Loading...</div>;
  }

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-text-primary">Support Tickets</h1>
        <div className="flex gap-2">
          <Button onClick={fetchTickets} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="reopened">Reopened</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      <Card className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <p>Loading tickets...</p>
          </div>
                 ) : !Array.isArray(tickets) || tickets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-muted">No support tickets found</p>
          </div>
        ) : (
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Tenant</th>
              <th>Subject</th>
                <th>Created By</th>
                <th>Priority</th>
              <th>Status</th>
                <th>Assigned To</th>
              <th>Date</th>
                <th>Actions</th>
            </tr>
          </thead>
          <tbody>
               {Array.isArray(tickets) && tickets.map((ticket) => (
              <tr key={ticket.id}>
                  <td className="font-mono text-sm">{ticket.ticket_id}</td>
                  <td>Tenant #{ticket.tenant}</td>
                  <td className="max-w-xs truncate" title={ticket.title}>
                    {ticket.title}
                  </td>
                  <td>
                    User #{ticket.created_by}
                  </td>
                  <td>
                    <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td>
                    <Badge variant={getStatusBadgeVariant(ticket.status)}>
                      {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                  </Badge>
                </td>
                  <td>
                    {ticket.assigned_to ? (
                      `User #${ticket.assigned_to}`
                    ) : (
                      <span className="text-text-muted">Unassigned</span>
                    )}
                  </td>
                  <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td>
                  <Link href={`/platform/support/${ticket.id}`} className="btn-tertiary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </Card>
    </div>
  );
}
 
 