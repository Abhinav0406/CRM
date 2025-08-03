'use client';

import React from 'react';
import { DashboardLayout, CardContainer } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Shield, 
  Database, 
  Globe, 
  Mail, 
  Bell,
  Save,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function PlatformSettingsPage() {
  return (
    <DashboardLayout
      title="System Settings"
      subtitle="Configure platform-wide settings and preferences"
      actions={
        <div className="flex items-center space-x-2">
          <Link href="/platform/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Button size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <CardContainer>
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">General Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="platform_name">Platform Name</Label>
              <Input
                id="platform_name"
                defaultValue="Jewelry CRM Platform"
                placeholder="Enter platform name"
              />
            </div>
            
            <div>
              <Label htmlFor="default_plan">Default Subscription Plan</Label>
              <Select defaultValue="professional">
                <SelectTrigger>
                  <SelectValue placeholder="Select default plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="max_users">Default Max Users per Tenant</Label>
              <Input
                id="max_users"
                type="number"
                defaultValue="5"
                placeholder="Enter max users"
              />
            </div>
          </div>
        </CardContainer>

        {/* Security Settings */}
        <CardContainer>
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Security Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div>
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout"
                type="number"
                defaultValue="30"
                placeholder="Enter timeout in minutes"
              />
            </div>
          </div>
        </CardContainer>

        {/* Email Settings */}
        <CardContainer>
          <div className="flex items-center space-x-2 mb-6">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Email Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                defaultValue="smtp.gmail.com"
                placeholder="Enter SMTP host"
              />
            </div>
            
            <div>
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                type="number"
                defaultValue="587"
                placeholder="Enter SMTP port"
              />
            </div>
            
            <div>
              <Label htmlFor="from_email">From Email</Label>
              <Input
                id="from_email"
                type="email"
                defaultValue="noreply@jewelrycrm.com"
                placeholder="Enter from email"
              />
            </div>
          </div>
        </CardContainer>

        {/* Notification Settings */}
        <CardContainer>
          <div className="flex items-center space-x-2 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Notification Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>New Tenant Notifications</Label>
                <p className="text-sm text-muted-foreground">Notify when new tenants join</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>System Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive system health alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Billing Notifications</Label>
                <p className="text-sm text-muted-foreground">Notify about payment issues</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContainer>
      </div>
    </DashboardLayout>
  );
} 