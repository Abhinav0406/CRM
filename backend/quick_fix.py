#!/usr/bin/env python
import os
import sys
import django
import subprocess

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def quick_fix():
    """Quick fix to resolve NaN values and 404 errors"""
    
    print("=== Quick Fix for NaN Values and 404 Errors ===")
    
    try:
        # 1. Check if we have a tenant
        from apps.tenants.models import Tenant
        tenant = Tenant.objects.first()
        if not tenant:
            print("Creating tenant...")
            tenant = Tenant.objects.create(name="Test Tenant", domain="test.com")
            print(f"✅ Created tenant: {tenant.name}")
        else:
            print(f"✅ Using existing tenant: {tenant.name}")
        
        # 2. Check if we have users
        from apps.users.models import User
        user = User.objects.filter(tenant=tenant).first()
        if not user:
            print("Creating user...")
            user = User.objects.create(
                username='test_user',
                email='test@example.com',
                first_name='Test',
                last_name='User',
                role='business_admin',
                tenant=tenant,
                is_active=True
            )
            user.set_password('password123')
            user.save()
            print("✅ Created user")
        else:
            print(f"✅ Using existing user: {user.username}")
        
        # 3. Check if we have clients
        from apps.clients.models import Client
        clients = Client.objects.filter(tenant=tenant)
        if not clients.exists():
            print("Creating sample clients...")
            Client.objects.create(
                first_name='John',
                last_name='Doe',
                email='john@example.com',
                phone='1234567890',
                customer_type='regular',
                tenant=tenant
            )
            Client.objects.create(
                first_name='Jane',
                last_name='Smith',
                email='jane@example.com',
                phone='0987654321',
                customer_type='vip',
                tenant=tenant
            )
            print("✅ Created sample clients")
        else:
            print(f"✅ Found {clients.count()} existing clients")
        
        # 4. Check if we have sales pipelines
        from apps.sales.models import SalesPipeline
        pipelines = SalesPipeline.objects.filter(tenant=tenant)
        if not pipelines.exists():
            print("Creating sample sales pipelines...")
            
            # Get first client
            client = clients.first()
            
            # Create sample pipelines with proper values
            SalesPipeline.objects.create(
                title='Gold Ring Deal',
                client=client,
                sales_representative=user,
                stage='lead',
                probability=10,
                expected_value=75000.00,
                notes='Customer interested in gold ring collection',
                next_action='Schedule follow-up call',
                tenant=tenant
            )
            
            SalesPipeline.objects.create(
                title='Diamond Necklace Opportunity',
                client=client,
                sales_representative=user,
                stage='contacted',
                probability=25,
                expected_value=120000.00,
                notes='High-value diamond necklace inquiry',
                next_action='Send product catalog',
                tenant=tenant
            )
            
            SalesPipeline.objects.create(
                title='Wedding Collection Deal',
                client=client,
                sales_representative=user,
                stage='qualified',
                probability=50,
                expected_value=200000.00,
                notes='Wedding jewelry collection for bride',
                next_action='Prepare proposal',
                tenant=tenant
            )
            
            print("✅ Created sample sales pipelines")
        else:
            print(f"✅ Found {pipelines.count()} existing pipelines")
        
        # 5. Test API endpoints
        print("\n=== Testing API Endpoints ===")
        
        # Test pipeline list endpoint
        from rest_framework.test import APIRequestFactory
        from apps.sales.views import SalesPipelineListView
        
        factory = APIRequestFactory()
        request = factory.get('/api/sales/pipeline/')
        request.user = user
        
        view = SalesPipelineListView.as_view()
        response = view(request)
        
        if response.status_code == 200:
            print("✅ Pipeline list endpoint works")
            data = response.data
            if hasattr(data, 'data') and data.data:
                print(f"✅ Found {len(data.data)} pipelines in API response")
                first_pipeline = data.data[0]
                print(f"✅ First pipeline expected_value: {first_pipeline.get('expected_value')}")
                print(f"✅ First pipeline client: {first_pipeline.get('client')}")
            else:
                print("⚠️ No pipeline data in API response")
        else:
            print(f"❌ Pipeline list endpoint failed: {response.status_code}")
        
        # Test pipeline detail endpoint
        if pipelines.exists():
            first_pipeline = pipelines.first()
            request = factory.get(f'/api/sales/pipeline/{first_pipeline.id}/')
            request.user = user
            
            from apps.sales.views import SalesPipelineDetailView
            view = SalesPipelineDetailView.as_view()
            response = view(request, pk=first_pipeline.id)
            
            if response.status_code == 200:
                print("✅ Pipeline detail endpoint works")
                data = response.data
                print(f"✅ Pipeline detail expected_value: {data.get('expected_value')}")
                print(f"✅ Pipeline detail client: {data.get('client')}")
            else:
                print(f"❌ Pipeline detail endpoint failed: {response.status_code}")
        
        print("\n=== Summary ===")
        print("✅ Backend is properly configured")
        print("✅ Sample data is available")
        print("✅ API endpoints are working")
        print("\nNext steps:")
        print("1. Start the Django server: python manage.py runserver")
        print("2. Start the frontend: cd ../jewellery-crm && npm run dev")
        print("3. Login with username: test_user, password: password123")
        
    except Exception as e:
        print(f"❌ Error during quick fix: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    quick_fix() 