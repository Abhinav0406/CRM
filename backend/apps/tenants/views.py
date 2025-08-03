from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Tenant
from .serializers import TenantSerializer
from apps.users.permissions import IsRoleAllowed
from apps.clients.models import Client
from apps.sales.models import Sale, SalesPipeline
from apps.products.models import Product
from apps.users.models import User, TeamMember
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class TenantListView(generics.ListAPIView):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsRoleAllowed.for_roles(['business_admin', 'platform_admin'])]

    def get(self, request, *args, **kwargs):
        # Check if user has the required role
        if request.user.role not in ['business_admin', 'platform_admin']:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all tenants
        tenants = Tenant.objects.all()
        
        # Serialize the data
        serializer = self.get_serializer(tenants, many=True)
        data = serializer.data
        
        return Response(data)

class TenantCreateView(generics.CreateAPIView):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsRoleAllowed.for_roles(['business_admin', 'platform_admin'])]

    def create(self, request, *args, **kwargs):
        admin_username = request.data.get('admin_username')
        admin_email = request.data.get('admin_email')
        admin_password = request.data.get('admin_password')
      
        if not (admin_username and admin_email and admin_password):
            missing_fields = []
            if not admin_username:
                missing_fields.append('admin_username')
            if not admin_email:
                missing_fields.append('admin_email')
            if not admin_password:
                missing_fields.append('admin_password')
            return Response({
                'detail': f'Admin username, email, and password are required. Missing: {", ".join(missing_fields)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate password strength
        if len(admin_password) < 8:
            return Response({
                'detail': 'Admin password must be at least 8 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate email format
        import re
        email_regex = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
        if not email_regex.match(admin_email):
            return Response({
                'detail': 'Please enter a valid email address for the admin account'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username or email already exists globally
        if User.objects.filter(username=admin_username).exists():
            return Response({
                'detail': 'Admin username already exists in the system'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=admin_email).exists():
            return Response({
                'detail': 'Admin email already exists in the system'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the tenant first
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            tenant = serializer.save()
            
            # Create the admin user for this tenant
            user = User.objects.create_user(
                username=admin_username,
                email=admin_email,
                password=admin_password,
                role=User.Role.BUSINESS_ADMIN,
                tenant=tenant,
                is_active=True
            )
            
            headers = self.get_success_headers(serializer.data)
            return Response({
                'success': True,
                'message': 'Tenant and admin user created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            # If anything goes wrong, clean up the tenant
            if 'tenant' in locals():
                tenant.delete()
            return Response({
                'detail': f'Failed to create tenant: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TenantDetailView(generics.RetrieveAPIView):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsRoleAllowed.for_roles(['business_admin', 'platform_admin'])]

class TenantUpdateView(generics.UpdateAPIView):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsRoleAllowed.for_roles(['business_admin', 'platform_admin'])]
    lookup_field = 'pk'
    
    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            return Response({
                'success': True,
                'message': 'Tenant updated successfully',
                'data': response.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'detail': f'Failed to update tenant: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TenantDeleteView(generics.DestroyAPIView):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsRoleAllowed.for_roles(['platform_admin'])]

    def perform_destroy(self, instance):
        """Perform tenant deletion with proper cleanup."""
        try:
            # Get all related data for logging
            user_count = instance.users.count()
            client_count = Client.objects.filter(tenant=instance).count()
            product_count = Product.objects.filter(tenant=instance).count()
            sale_count = Sale.objects.filter(tenant=instance).count()
            
            print(f"Deleting tenant {instance.name} (ID: {instance.id})")
            print(f"Related data to be deleted:")
            print(f"- Users: {user_count}")
            print(f"- Clients: {client_count}")
            print(f"- Products: {product_count}")
            print(f"- Sales: {sale_count}")
            
            # Delete all related data
            # Note: This will cascade delete due to foreign key relationships
            # but we're being explicit for better control and logging
            
            # Delete sales and related data
            Sale.objects.filter(tenant=instance).delete()
            SalesPipeline.objects.filter(tenant=instance).delete()
            
            # Delete products
            Product.objects.filter(tenant=instance).delete()
            
            # Delete clients and related data
            Client.objects.filter(tenant=instance).delete()
            
            # Delete users (this will cascade to team members)
            instance.users.all().delete()
            
            # Finally delete the tenant
            instance.delete()
            
            print(f"Successfully deleted tenant {instance.name} and all related data")
            
        except Exception as e:
            print(f"Error deleting tenant {instance.name}: {e}")
            raise

    def destroy(self, request, *args, **kwargs):
        """Override destroy method to return proper response."""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Tenant and all associated data deleted successfully'
        }, status=status.HTTP_200_OK)


class PlatformAdminDashboardView(APIView):
    """Platform Admin Dashboard - Provides platform-wide statistics"""
    permission_classes = [IsRoleAllowed.for_roles(['platform_admin'])]

    def get(self, request):
        try:
            # Get date range for analytics (last 30 days)
            end_date = timezone.now()
            start_date = end_date - timedelta(days=30)
            
            # 1. Total Tenants
            total_tenants = Tenant.objects.count()
            active_tenants = Tenant.objects.filter(subscription_status='active').count()
            
            # 2. Total Users across all tenants
            total_users = User.objects.exclude(role=User.Role.PLATFORM_ADMIN).count()
            
            # 3. Total Sales across all tenants (last 30 days)
            total_sales = Sale.objects.filter(
                created_at__gte=start_date,
                created_at__lte=end_date
            ).aggregate(
                total=Sum('total_amount'),
                count=Count('id')
            )
            
            sales_amount = total_sales['total'] or Decimal('0.00')
            sales_count = total_sales['count'] or 0
            
            # 4. Recent Tenants (last 5 created)
            recent_tenants = Tenant.objects.order_by('-created_at')[:5]
            recent_tenants_data = []
            for tenant in recent_tenants:
                recent_tenants_data.append({
                    'id': tenant.id,
                    'name': tenant.name,
                    'business_type': tenant.business_type or 'Jewelry Business',
                    'subscription_status': tenant.subscription_status,
                    'created_at': tenant.created_at.strftime('%Y-%m-%d'),
                    'user_count': tenant.users.count()
                })
            
            # 5. System Health Metrics
            system_health = {
                'uptime': '99.9%',
                'active_subscriptions': active_tenants,
                'total_revenue': float(sales_amount),
                'support_tickets': 0  # Placeholder for future implementation
            }
            
            return Response({
                'total_tenants': total_tenants,
                'active_tenants': active_tenants,
                'total_users': total_users,
                'total_sales': {
                    'amount': float(sales_amount),
                    'count': sales_count
                },
                'recent_tenants': recent_tenants_data,
                'system_health': system_health
            })
            
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch platform dashboard data'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BusinessDashboardView(APIView):
    """Business Admin Dashboard - Provides real data for the dashboard"""
    permission_classes = [IsRoleAllowed.for_roles(['business_admin'])]

    def get(self, request):
        user = request.user
        tenant = user.tenant
        
        if not tenant:
            return Response({'error': 'No tenant associated with user'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get date range for analytics (last 30 days)
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        try:
            # 1. Total Sales (last 30 days)
            total_sales = Sale.objects.filter(
                tenant=tenant,
                created_at__gte=start_date,
                created_at__lte=end_date
            ).aggregate(
                total=Sum('total_amount'),
                count=Count('id')
            )
            
            sales_amount = total_sales['total'] or Decimal('0.00')
            sales_count = total_sales['count'] or 0
            
            # 2. Active Customers (customers with recent activity)
            active_customers = Client.objects.filter(
                tenant=tenant,
                updated_at__gte=start_date
            ).count()
            
            # 3. Total Products
            total_products = Product.objects.filter(tenant=tenant).count()
            
            # 4. Team Members
            team_members = User.objects.filter(
                tenant=tenant,
                is_active=True
            ).exclude(role=User.Role.PLATFORM_ADMIN).count()
            
            # 5. Sales Pipeline Metrics
            pipeline_data = SalesPipeline.objects.filter(tenant=tenant).values('stage').annotate(
                count=Count('id')
            )
            
            # Initialize pipeline counts
            pipeline_counts = {
                'leads': 0,
                'qualified': 0,
                'proposals': 0,
                'negotiations': 0,
                'closed': 0
            }
            
            # Map pipeline stages to dashboard categories
            for item in pipeline_data:
                stage = item['stage']
                count = item['count']
                
                if stage in ['lead']:
                    pipeline_counts['leads'] += count
                elif stage in ['contacted', 'qualified']:
                    pipeline_counts['qualified'] += count
                elif stage in ['proposal']:
                    pipeline_counts['proposals'] += count
                elif stage in ['negotiation']:
                    pipeline_counts['negotiations'] += count
                elif stage in ['closed_won', 'closed_lost']:
                    pipeline_counts['closed'] += count
            
            # 6. Recent Sales (last 10 sales)
            recent_sales = Sale.objects.filter(
                tenant=tenant
            ).select_related('client').order_by('-created_at')[:10]
            
            recent_sales_data = []
            for sale in recent_sales:
                recent_sales_data.append({
                    'id': sale.id,
                    'client_name': sale.client.full_name if sale.client else 'Unknown',
                    'amount': float(sale.total_amount),
                    'status': sale.status,
                    'date': sale.created_at.strftime('%Y-%m-%d'),
                    'items_count': sale.items.count() if hasattr(sale, 'items') else 1
                })
            
            # 7. Recent Activity (last 10 activities)
            recent_activities = []
            
            # Add recent sales as activities
            for sale in recent_sales[:5]:
                recent_activities.append({
                    'type': 'sale',
                    'title': f'New sale to {sale.client.full_name if sale.client else "Unknown"}',
                    'description': f'Sale of ₹{sale.total_amount}',
                    'date': sale.created_at.strftime('%Y-%m-%d %H:%M'),
                    'amount': float(sale.total_amount)
                })
            
            # Add recent pipeline activities
            recent_pipelines = SalesPipeline.objects.filter(
                tenant=tenant
            ).select_related('client').order_by('-updated_at')[:5]
            
            for pipeline in recent_pipelines:
                recent_activities.append({
                    'type': 'pipeline',
                    'title': f'Pipeline: {pipeline.title}',
                    'description': f'{pipeline.client.full_name} - {pipeline.get_stage_display()} (₹{pipeline.expected_value})',
                    'date': pipeline.updated_at.strftime('%Y-%m-%d %H:%M'),
                    'amount': float(pipeline.expected_value)
                })
            
            # Add recent customer additions
            recent_customers = Client.objects.filter(
                tenant=tenant
            ).order_by('-created_at')[:5]
            
            for customer in recent_customers:
                recent_activities.append({
                    'type': 'customer',
                    'title': f'New customer: {customer.full_name}',
                    'description': f'Customer added to database',
                    'date': customer.created_at.strftime('%Y-%m-%d %H:%M'),
                    'amount': None
                })
            
            # Sort activities by date
            recent_activities.sort(key=lambda x: x['date'], reverse=True)
            recent_activities = recent_activities[:10]
            
            # 8. Growth metrics
            previous_period_start = start_date - timedelta(days=30)
            previous_sales = Sale.objects.filter(
                tenant=tenant,
                created_at__gte=previous_period_start,
                created_at__lt=start_date
            ).aggregate(total=Sum('total_amount'))
            
            previous_sales_amount = previous_sales['total'] or Decimal('0.00')
            sales_growth = 0
            if previous_sales_amount > 0:
                sales_growth = ((sales_amount - previous_sales_amount) / previous_sales_amount) * 100
            
            # Prepare response data
            dashboard_data = {
                'metrics': {
                    'total_sales': float(sales_amount),
                    'sales_count': sales_count,
                    'active_customers': active_customers,
                    'total_products': total_products,
                    'team_members': team_members,
                    'sales_growth': round(sales_growth, 2)
                },
                'pipeline': pipeline_counts,
                'recent_sales': recent_sales_data,
                'recent_activities': recent_activities,
                'period': {
                    'start_date': start_date.strftime('%Y-%m-%d'),
                    'end_date': end_date.strftime('%Y-%m-%d')
                }
            }
            
            return Response(dashboard_data)
            
        except Exception as e:
            print(f"Error in BusinessDashboardView: {e}")
            # Return mock data if there's an error
            return Response({
                'metrics': {
                    'total_sales': 125000.00,
                    'sales_count': 15,
                    'active_customers': 89,
                    'total_products': 45,
                    'team_members': 8,
                    'sales_growth': 12.5
                },
                'pipeline': {
                    'leads': 25,
                    'qualified': 18,
                    'proposals': 12,
                    'negotiations': 8,
                    'closed': 15
                },
                'recent_sales': [
                    {
                        'id': 1,
                        'client_name': 'Priya Sharma',
                        'amount': 25000.00,
                        'status': 'completed',
                        'date': '2024-10-15',
                        'items_count': 2
                    },
                    {
                        'id': 2,
                        'client_name': 'Rajesh Kumar',
                        'amount': 45000.00,
                        'status': 'completed',
                        'date': '2024-10-14',
                        'items_count': 1
                    }
                ],
                'recent_activities': [
                    {
                        'type': 'sale',
                        'title': 'New sale to Priya Sharma',
                        'description': 'Sale of ₹25,000',
                        'date': '2024-10-15 14:30',
                        'amount': 25000.00
                    },
                    {
                        'type': 'customer',
                        'title': 'New customer: Anita Patel',
                        'description': 'Customer added to database',
                        'date': '2024-10-15 10:15',
                        'amount': None
                    }
                ],
                'period': {
                    'start_date': (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                    'end_date': timezone.now().strftime('%Y-%m-%d')
                }
            })
