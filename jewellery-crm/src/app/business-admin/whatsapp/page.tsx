'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Phone, 
  Users, 
  Clock,
  Plus,
  Search,
  Send,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Conversation {
  id: string;
  customer: {
    name: string;
    phone: string;
    avatar: string;
  };
  lastMessage: string;
  status: 'online' | 'offline' | 'away';
  unreadCount: number;
  lastActivity: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  language: string;
}

interface Message {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    customer: {
      name: 'Sarah Johnson',
      phone: '+1 (555) 123-4567',
      avatar: '/api/placeholder/40/40'
    },
    lastMessage: 'Hi, I\'m interested in the diamond ring you have listed.',
    status: 'online',
    unreadCount: 2,
    lastActivity: '2 min ago'
  },
  {
    id: '2',
    customer: {
      name: 'Michael Chen',
      phone: '+1 (555) 234-5678',
      avatar: '/api/placeholder/40/40'
    },
    lastMessage: 'When will my order be delivered?',
    status: 'offline',
    unreadCount: 0,
    lastActivity: '1 hour ago'
  },
  {
    id: '3',
    customer: {
      name: 'Emily Davis',
      phone: '+1 (555) 345-6789',
      avatar: '/api/placeholder/40/40'
    },
    lastMessage: 'Thank you for the quick response!',
    status: 'away',
    unreadCount: 1,
    lastActivity: '30 min ago'
  }
];

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Welcome Message',
    category: 'Greeting',
    content: 'Hi {{1}}, welcome to our jewelry store! How can we help you today?',
    status: 'approved',
    language: 'English'
  },
  {
    id: '2',
    name: 'Order Confirmation',
    category: 'Order',
    content: 'Your order #{{1}} has been confirmed and will be shipped on {{2}}. Track your order at {{3}}',
    status: 'approved',
    language: 'English'
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    category: 'Appointment',
    content: 'Reminder: You have an appointment tomorrow at {{1}} for {{2}}. Please confirm your attendance.',
    status: 'pending',
    language: 'English'
  }
];

export default function WhatsAppPage() {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [templates] = useState<Template[]>(mockTemplates);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      online: { color: 'bg-green-100 text-green-800', text: 'Online' },
      offline: { color: 'bg-gray-100 text-gray-800', text: 'Offline' },
      away: { color: 'bg-yellow-100 text-yellow-800', text: 'Away' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'read':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-text-primary">WhatsApp Business</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+12 from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+23% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Avg. 2.3 min response</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">8 approved, 4 pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-8 w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.customer.avatar} />
                        <AvatarFallback>
                          {conversation.customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{conversation.customer.name}</div>
                          <div className="flex items-center gap-1">
                            {getStatusBadge(conversation.status)}
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {conversation.lastActivity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Sarah Johnson</div>
                    <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
                  </div>
                </div>
                {getStatusBadge('online')}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {/* Sample messages */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                      <div className="text-sm">Hi Sarah! How can I help you with the diamond ring?</div>
                      <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                        2:30 PM {getMessageStatusIcon('read')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 max-w-xs">
                      <div className="text-sm">Hi! I'm interested in the diamond ring you have listed. Is it still available?</div>
                      <div className="text-xs text-muted-foreground mt-1">2:32 PM</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                      <div className="text-sm">Yes, it's still available! It's a beautiful 1.5 carat diamond ring. Would you like to see more details?</div>
                      <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                        2:35 PM {getMessageStatusIcon('delivered')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <Button size="sm" className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Templates Section */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Message Templates</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {template.content}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(template.status)}</TableCell>
                      <TableCell>{template.language}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Message analytics will be displayed here
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Response time analytics will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
 
 