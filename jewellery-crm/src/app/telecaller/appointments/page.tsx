'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye } from 'lucide-react';

const stats = [
  { label: 'Total Appointments', value: 6 },
  { label: 'Upcoming', value: 2 },
  { label: 'Completed', value: 3 },
  { label: 'Cancelled', value: 1 },
];

const appointments = [
  { customer: 'Priya S.', datetime: '7/30/2025, 10:00 AM', type: 'Consultation', status: 'upcoming' },
  { customer: 'Amit R.', datetime: '7/29/2025, 2:00 PM', type: 'Pickup', status: 'completed' },
  { customer: 'Sneha K.', datetime: '7/28/2025, 11:00 AM', type: 'Repair', status: 'cancelled' },
];

export default function TelecallerAppointmentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Appointments</h1>
          <p className="text-text-secondary mt-1">Book appointments for the sales team</p>
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
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Type</th>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={i} className="border-t border-border hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-text-primary">{a.customer}</td>
                  <td className="px-4 py-2 text-text-primary">{a.datetime}</td>
                  <td className="px-4 py-2 text-text-primary">{a.type}</td>
                  <td className="px-4 py-2"><Badge variant="outline" className="capitalize text-xs">{a.status}</Badge></td>
                  <td className="px-4 py-2"><Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}