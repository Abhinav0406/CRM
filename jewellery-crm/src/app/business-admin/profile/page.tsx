'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordForm } from '@/components/ui/password-form';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/api-service';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit2, 
  Save, 
  X, 
  CheckCircle,
  Building2,
  Store
} from 'lucide-react';

interface ProfileData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  role: string;
  tenant_name?: string;
  store_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await apiService.getCurrentUser();
        if (response.success) {
          setProfileData(response.data);
          setEditFormData({
            first_name: response.data.first_name || '',
            last_name: response.data.last_name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
          });
        } else {
          setError('Failed to load profile data');
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated]);

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSaveProfile = async () => {
    if (!profileData) return;

    try {
      setSaving(true);
      setError(null);

      // Call the API to update the profile
      const response = await apiService.updateProfile(editFormData);
      
      if (response.success) {
        // Update local profile data with the response
        setProfileData(response.data);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }

      setEditMode(false);
      setSuccess('Profile updated successfully!');
      
      // Auto-hide success message
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profileData) {
      setEditFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
      });
    }
    setEditMode(false);
    setError(null);
    setSuccess(null);
  };

  const handlePasswordChangeSuccess = () => {
    setSuccess('Password changed successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handlePasswordChangeError = (error: string) => {
    setError(error);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'business_admin':
        return 'Business Admin';
      case 'platform_admin':
        return 'Platform Admin';
      case 'manager':
        return 'Manager';
      case 'inhouse_sales':
        return 'In-house Sales';
      case 'tele_calling':
        return 'Tele-calling';
      case 'marketing':
        return 'Marketing';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'business_admin':
        return 'bg-purple-100 text-purple-800';
      case 'platform_admin':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      case 'inhouse_sales':
        return 'bg-orange-100 text-orange-800';
      case 'tele_calling':
        return 'bg-pink-100 text-pink-800';
      case 'marketing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load profile data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">My Profile</h1>
          <p className="text-text-secondary mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" alt={`${profileData.first_name} ${profileData.last_name}`} />
                    <AvatarFallback className="text-lg">
                      {profileData.first_name?.charAt(0)}{profileData.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {profileData.first_name} {profileData.last_name}
                    </h2>
                    <p className="text-text-secondary">@{profileData.username}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleColor(profileData.role)}>
                        {getRoleDisplayName(profileData.role)}
                      </Badge>
                      {profileData.is_active && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant={editMode ? "outline" : "default"}
                  onClick={() => editMode ? handleCancelEdit() : setEditMode(true)}
                  disabled={saving}
                >
                  {editMode ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        {editMode ? (
                          <Input
                            id="first_name"
                            value={editFormData.first_name}
                            onChange={(e) => handleEditInputChange('first_name', e.target.value)}
                            disabled={saving}
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">{profileData.first_name || 'Not set'}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        {editMode ? (
                          <Input
                            id="last_name"
                            value={editFormData.last_name}
                            onChange={(e) => handleEditInputChange('last_name', e.target.value)}
                            disabled={saving}
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">{profileData.last_name || 'Not set'}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      {editMode ? (
                        <Input
                          id="email"
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => handleEditInputChange('email', e.target.value)}
                          disabled={saving}
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profileData.email || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      {editMode ? (
                        <Input
                          id="phone"
                          value={editFormData.phone}
                          onChange={(e) => handleEditInputChange('phone', e.target.value)}
                          disabled={saving}
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profileData.phone || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </Label>
                      {editMode ? (
                        <Input
                          id="address"
                          value={editFormData.address}
                          onChange={(e) => handleEditInputChange('address', e.target.value)}
                          disabled={saving}
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profileData.address || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Organization Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Tenant
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">{profileData.tenant_name || 'Not assigned'}</p>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        Store
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">{profileData.store_name || 'Not assigned'}</p>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Member Since
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(profileData.created_at)}</p>
                    </div>

                    {profileData.last_login && (
                      <div>
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Last Login
                        </Label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(profileData.last_login)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {editMode && (
                <div className="flex items-center gap-4 mt-6 pt-6 border-t">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Password Change */}
          <PasswordForm 
            onSuccess={handlePasswordChangeSuccess}
            onError={handlePasswordChangeError}
          />

          {/* Account Security Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>
                Keep your account secure with these recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-green-600 mb-2">✓ Strong Password</h4>
                  <p className="text-sm text-gray-600">
                    Use a password that's at least 8 characters long with a mix of letters, numbers, and symbols.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-green-600 mb-2">✓ Regular Updates</h4>
                  <p className="text-sm text-gray-600">
                    Change your password regularly, especially if you suspect unauthorized access.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-blue-600 mb-2">🔒 Secure Connection</h4>
                  <p className="text-sm text-gray-600">
                    Always access your account from secure, trusted networks and devices.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-blue-600 mb-2">📱 Log Out</h4>
                  <p className="text-sm text-gray-600">
                    Remember to log out when using shared or public computers.
                  </p>
                </div>
              </div>
            </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
 