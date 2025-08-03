'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AddCustomerModal } from '@/components/customers/AddCustomerModal';
import { apiService, Client } from '@/lib/api-service';

export default function ManagerCustomersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClients();
      if (response.success && response.data && Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        console.warn('Customers response is not an array:', response.data);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer => {
    const matchesSearch = customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      <AddCustomerModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Customers</h1>
          <p className="text-text-secondary mt-1">View and segment your customer base</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button className="btn-primary" size="sm" onClick={() => setModalOpen(true)}>+ Add Customer</Button>
          <Button variant="outline" size="sm">Export CSV</Button>
          <Button variant="outline" size="sm">Export JSON</Button>
        </div>
      </div>
      <Card className="p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <Input placeholder="Search by name, email, or phone..." className="w-full md:w-80" />
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-white mt-2">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Customer</th>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Contact</th>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Location</th>
                <th className="px-4 py-2 text-left font-semibold text-text-secondary">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c, i) => (
                <tr key={i} className="border-t border-border hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium text-text-primary">{`${c.first_name} ${c.last_name}`}</div>
                    <div className="text-xs text-text-muted">{c.customer_type}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-text-primary">{c.email}</div>
                    <div className="text-xs text-text-muted">{c.phone}</div>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant="outline" className="text-xs capitalize">{c.status || 'lead'}</Badge>
                  </td>
                  <td className="px-4 py-2 text-text-primary">{`${c.city || ''}, ${c.state || ''}`}</td>
                  <td className="px-4 py-2 text-text-secondary">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}