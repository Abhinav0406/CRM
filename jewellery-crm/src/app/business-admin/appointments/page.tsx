'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter, MoreHorizontal, Calendar, Clock, User, MapPin } from 'lucide-react';
import { apiService } from '@/lib/api-service';

interface Appointment {
  id: number;
  client: number;
  client_name?: string;
  tenant: number;
  date: string;
  time: string;
  purpose: string;
  notes?: string;
  status: string;
  reminder_sent: boolean;
  reminder_date?: string;
  requires_follow_up: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  duration: number;
  location?: string;
  outcome_notes?: string;
  next_action?: string;
  created_by?: number;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAppointments({
        page: currentPage,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      
      if (response.success) {
        const data = response.data as any;
        setAppointments(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'outline';
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'rescheduled':
        return 'outline';
      case 'no_show':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= now && apt.status === 'scheduled';
    }).length;
  };

  const getTodayAppointments = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === todayStr).length;
  };

  const getCompletedAppointments = () => {
    return appointments.filter(apt => apt.status === 'completed').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Appointments</h1>
          <p className="text-text-secondary mt-1">Manage customer appointments and schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Appointments</p>
                <p className="text-2xl font-bold text-text-primary">{appointments.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Today's Appointments</p>
                <p className="text-2xl font-bold text-text-primary">{getTodayAppointments()}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Upcoming</p>
                <p className="text-2xl font-bold text-text-primary">{getUpcomingAppointments()}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Completed</p>
                <p className="text-2xl font-bold text-text-primary">{getCompletedAppointments()}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-semibold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-text-secondary">Loading appointments...</div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-text-secondary mb-2">No appointments found</div>
              <Button variant="outline">
                Schedule your first appointment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Date & Time</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Purpose</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">
                              {appointment.client_name || `Client #${appointment.client}`}
                            </div>
                            <div className="text-sm text-text-secondary">
                              ID: {appointment.client}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-text-primary">
                            {formatDate(appointment.date)}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {formatTime(appointment.time)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <div className="text-text-primary">{appointment.purpose}</div>
                          {appointment.notes && (
                            <div className="text-sm text-text-secondary truncate">
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-text-secondary">
                            {appointment.location || 'Not specified'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status?.replace('_', ' ').charAt(0).toUpperCase() + appointment.status?.replace('_', ' ').slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {appointment.duration} min
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
 
 