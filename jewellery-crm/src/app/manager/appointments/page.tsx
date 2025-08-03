'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye } from 'lucide-react';
import { apiService, Appointment } from '@/lib/api-service';

export default function ManagerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAppointments();
      if (response.success && response.data && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        console.warn('Appointments response is not an array:', response.data);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(appointment => {
    const matchesSearch = appointment.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const stats = [
    { label: 'Total Appointments', value: Array.isArray(appointments) ? appointments.length : 0 },
    { label: 'Upcoming', value: Array.isArray(appointments) ? appointments.filter(a => a.status === 'confirmed').length : 0 },
    { label: 'Completed', value: Array.isArray(appointments) ? appointments.filter(a => a.status === 'completed').length : 0 },
    { label: 'Cancelled', value: Array.isArray(appointments) ? appointments.filter(a => a.status === 'cancelled').length : 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Appointments</h1>
          <p className="text-text-secondary mt-1">Manage and track all appointments</p>
        </div>
        <Button className="btn-primary text-sm flex items-center gap-1"><Calendar className="w-4 h-4" /> New Appointment</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col gap-1 p-5">
            <div className="text-xl font-bold text-text-primary">{s.value}</div>
            <div className="text-sm text-text-secondary font-medium">{s.label}</div>
          </Card>
        ))}
      </div>
      <Card className="p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <Input placeholder="Search by customer or type..." className="w-full md:w-80" />
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-white mt-2">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Customer</th>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Date/Time</th>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Purpose</th>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((a, i) => (
                  <tr key={i} className="border-t border-border hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-text-primary">Customer #{a.client}</td>
                    <td className="px-4 py-2 text-text-primary">
                      {new Date(a.date).toLocaleDateString()}, {a.time}
                    </td>
                    <td className="px-4 py-2 text-text-primary">{a.purpose}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className="capitalize text-xs">{a.status}</Badge>
                    </td>
                    <td className="px-4 py-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}