'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiService, Appointment } from '@/lib/api-service';
import { Calendar, Eye, Search, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AppointmentDetailModal } from '@/components/appointments/AppointmentDetailModal';

interface AppointmentStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

export default function SalesAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    // Filter appointments based on search term and status
    let filtered = appointments || [];
    
    if (searchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.client?.toString().includes(searchTerm)
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  useEffect(() => {
    // Calculate stats from appointments
    const appointmentsArray = appointments || [];
    const totalAppointments = appointmentsArray.length;
    const upcomingAppointments = appointmentsArray.filter(a => 
      a.status === 'scheduled' || a.status === 'confirmed'
    ).length;
    const completedAppointments = appointmentsArray.filter(a => a.status === 'completed').length;
    const cancelledAppointments = appointmentsArray.filter(a => a.status === 'cancelled').length;

    setStats({
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
    });
  }, [appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING APPOINTMENTS ===');
      const response = await apiService.getAppointments();
      console.log('Appointments API response:', response);
      console.log('Response success:', response.success);
      console.log('Response data type:', typeof response.data);
      console.log('Response data:', response.data);
      
      // Ensure we have an array of appointments
      const appointmentsData = Array.isArray(response.data) ? response.data : [];
      console.log('Processed appointments data:', appointmentsData);
      console.log('Appointments count:', appointmentsData.length);
      
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    const time = timeString ? timeString : '00:00';
    const [hours, minutes] = time.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'default';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
      case 'no_show':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleCreateAppointment = () => {
    // This would navigate to create appointment page
    console.log('Creating new appointment');
    // In a real implementation, this would navigate to create appointment
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Appointments</h1>
            <p className="text-text-secondary mt-1">Schedule and manage your appointments</p>
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
        <Card className="p-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Appointments</h1>
          <p className="text-text-secondary mt-1">Schedule and manage your appointments</p>
        </div>
        <Button className="btn-primary text-sm flex items-center gap-1" onClick={handleCreateAppointment}>
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col gap-1 p-5">
          <div className="text-xl font-bold text-text-primary">{stats.totalAppointments}</div>
          <div className="text-sm text-text-secondary font-medium">Total Appointments</div>
        </Card>
        <Card className="flex flex-col gap-1 p-5">
          <div className="text-xl font-bold text-blue-600">{stats.upcomingAppointments}</div>
          <div className="text-sm text-text-secondary font-medium">Upcoming</div>
        </Card>
        <Card className="flex flex-col gap-1 p-5">
          <div className="text-xl font-bold text-green-600">{stats.completedAppointments}</div>
          <div className="text-sm text-text-secondary font-medium">Completed</div>
        </Card>
        <Card className="flex flex-col gap-1 p-5">
          <div className="text-xl font-bold text-red-600">{stats.cancelledAppointments}</div>
          <div className="text-sm text-text-secondary font-medium">Cancelled</div>
        </Card>
      </div>
      
      <Card className="p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search by customer or purpose..." 
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-border bg-white mt-2">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Date/Time</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Purpose</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Duration</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-t border-border hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-text-primary">
                      Customer #{appointment.client}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {formatDateTime(appointment.date, appointment.time)}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      <div className="max-w-xs truncate" title={appointment.purpose}>
                        {appointment.purpose}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(appointment.status)}
                        <Badge variant={getStatusBadgeVariant(appointment.status)} className="capitalize text-xs">
                          {appointment.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {appointment.duration} min
                    </td>
                    <td className="px-4 py-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleViewAppointment(appointment)}
                        title="View appointment details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    {appointments.length === 0 ? 'No appointments found' : 'No appointments match your search criteria'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredAppointments.length > 0 && (
          <div className="text-sm text-text-secondary text-center py-2">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </div>
        )}
      </Card>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAppointment(null);
        }}
      />
    </div>
  );
}