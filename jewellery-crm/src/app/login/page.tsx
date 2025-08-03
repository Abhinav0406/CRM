'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, User, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, user } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!username || !password) {
      setLoginError('Please enter both username and password');
      return;
    }

    const success = await login(username, password);
    console.log('Login success:', success);
    
    if (success) {
      // Get the current user state after login
      const currentUser = useAuth.getState().user;
      console.log('Current user state after login:', currentUser);
      
      if (currentUser) {
        console.log('User role from state:', currentUser.role);
        // Redirect based on user role from backend
        switch (currentUser.role) {
          case 'platform_admin':
            console.log('Redirecting to platform dashboard');
            router.push('/platform/dashboard');
            break;
          case 'business_admin':
            console.log('Redirecting to business admin dashboard');
            router.push('/business-admin/dashboard');
            break;
          case 'manager':
            console.log('Redirecting to manager dashboard');
            router.push('/manager/dashboard');
            break;
          case 'sales_team':
          case 'inhouse_sales':
            console.log('Redirecting to sales dashboard');
            router.push('/sales/dashboard');
            break;
          case 'marketing':
            console.log('Redirecting to marketing dashboard');
            router.push('/marketing/dashboard');
            break;
          case 'tele_calling':
            console.log('Redirecting to telecaller dashboard');
            router.push('/telecaller/dashboard');
            break;
          default:
            console.log('Unknown role:', currentUser.role, 'redirecting to sales dashboard');
            router.push('/sales/dashboard');
        }
      } else {
        console.log('No user data, redirecting to sales dashboard');
        router.push('/sales/dashboard');
      }
    } else {
      setLoginError('Invalid username or password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your Jewellery CRM account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {(loginError || error) && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {loginError || error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                Need help? Contact your system administrator
              </p>
              
              {/* Demo Login Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  setUsername('rara');
                  setPassword('password123');
                }}
                disabled={isLoading}
              >
                Use Demo Credentials (rara / password123)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 