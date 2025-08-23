#!/usr/bin/env python
"""
Test script to test with real user credentials and check sales pipeline duplication
"""
import os
import sys
import django
import json

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.clients.models import Client
from apps.sales.models import SalesPipeline
from apps.users.models import User

def test_real_user_pipeline():
    """Test with real user credentials to check pipeline duplication"""
    print("🧪 Testing with Real User Credentials...")
    
    try:
        # Get the real user
        user = User.objects.get(username='das')
        print(f"✅ Found user: {user.username} ({user.email})")
        print(f"   - Tenant: {user.tenant}")
        print(f"   - Store: {user.store}")
        
        # Test data for customer interests
        initial_interests = [
            {
                'category': 'Gold',
                'products': [
                    {'product': 'Kasula Pera', 'revenue': '50000'}
                ],
                'preferences': {
                    'designSelected': True,
                    'wantsDiscount': False,
                    'checkingOthers': False,
                    'lessVariety': False,
                    'other': ''
                }
            }
        ]
        
        # Convert to JSON strings as the frontend would send
        customer_interests_input = [json.dumps(interest) for interest in initial_interests]
        
        print(f"📝 Initial interests data: {customer_interests_input}")
        
        # Test 1: Create customer with initial interests
        print("\n🔄 Test 1: Creating customer with initial interests...")
        
        # Simulate what the frontend would do
        from apps.clients.serializers import ClientSerializer
        context = {'request': type('MockRequest', (), {'user': user})()}
        
        create_data = {
            'first_name': 'Pipeline',
            'last_name': 'TestCustomer',
            'email': 'pipelinecustomer@test.com',
            'phone': '9876543210',
            'customer_interests_input': customer_interests_input
        }
        
        serializer = ClientSerializer(data=create_data, context=context)
        if serializer.is_valid():
            customer = serializer.save()
            print(f"✅ Customer created: {customer.id}")
            
            # Check initial interests
            interests = customer.interests.all()
            print(f"✅ Initial interests created: {interests.count()}")
            for interest in interests:
                print(f"   - {interest.category.name}: {interest.product.name} (₹{interest.revenue})")
            
            # Check initial sales pipeline
            pipelines = SalesPipeline.objects.filter(client=customer)
            print(f"✅ Initial sales pipelines: {pipelines.count()}")
            for pipeline in pipelines:
                print(f"   - Pipeline {pipeline.id}: {pipeline.stage} (₹{pipeline.expected_value})")
            
            # Test 2: Update customer with additional interests (should consolidate, not duplicate)
            print("\n🔄 Test 2: Adding new interests (should consolidate, not duplicate)...")
            
            additional_interests = initial_interests + [
                {
                    'category': 'Diamond',
                    'products': [
                        {'product': 'Diamond Ring', 'revenue': '100000'}
                    ],
                    'preferences': {
                        'designSelected': False,
                        'wantsDiscount': True,
                        'checkingOthers': False,
                        'lessVariety': False,
                        'other': ''
                    }
                }
            ]
            
            additional_interests_input = [json.dumps(interest) for interest in additional_interests]
            
            print(f"📝 Additional interests data: {additional_interests_input}")
            
            additional_update_data = {
                'first_name': 'Pipeline',
                'last_name': 'TestCustomer',
                'customer_interests_input': additional_interests_input
            }
            
            additional_serializer = ClientSerializer(customer, data=additional_update_data, context=context, partial=True)
            if additional_serializer.is_valid():
                final_customer = additional_serializer.save()
                print(f"✅ Customer updated with additional interests: {final_customer.id}")
                
                # Check final interests
                final_interests = final_customer.interests.all()
                print(f"✅ Final interests: {final_interests.count()}")
                for interest in final_interests:
                    print(f"   - {interest.category.name}: {interest.product.name} (₹{interest.revenue})")
                
                # Check final sales pipelines (should still be consolidated)
                final_pipelines = SalesPipeline.objects.filter(client=final_customer)
                print(f"✅ Final sales pipelines: {final_pipelines.count()}")
                for pipeline in final_pipelines:
                    print(f"   - Pipeline {pipeline.id}: {pipeline.stage} (₹{pipeline.expected_value})")
                
                # Verify consolidation
                if final_pipelines.count() <= pipelines.count():
                    print("🎉 SUCCESS: Pipeline consolidation working - no unnecessary duplication!")
                else:
                    print(f"❌ FAILURE: Pipeline count increased from {pipelines.count()} to {final_pipelines.count()}")
                    print("This indicates the frontend is still creating duplicate pipelines!")
                    
            else:
                print("❌ Additional update validation failed:")
                print(additional_serializer.errors)
                
        else:
            print("❌ CREATE validation failed:")
            print(serializer.errors)
            
    except User.DoesNotExist:
        print("❌ User 'das' not found!")
        print("Available users:")
        users = User.objects.all()[:10]  # Show first 10 users
        for u in users:
            print(f"   - {u.username} ({u.email})")
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

def cleanup_test_data():
    """Clean up test data"""
    print("\n🧹 Cleaning up test data...")
    
    try:
        # Delete test customers and related data
        test_customers = Client.objects.filter(email__contains='@test.com')
        print(f"Found {test_customers.count()} test customers to delete")
        
        for customer in test_customers:
            # Delete related sales pipelines
            pipelines = SalesPipeline.objects.filter(client=customer)
            print(f"Deleting {pipelines.count()} sales pipelines for customer {customer.id}")
            pipelines.delete()
            
            # Delete customer interests
            interests = customer.interests.all()
            print(f"Deleting {interests.count()} interests for customer {customer.id}")
            interests.delete()
            
            # Delete customer
            customer.delete()
            print(f"Deleted customer {customer.id}")
        
        print("✅ Test data cleanup completed!")
        
    except Exception as e:
        print(f"❌ Cleanup failed: {e}")

if __name__ == '__main__':
    test_real_user_pipeline()
    
    # Ask if user wants to clean up
    response = input("\n🧹 Do you want to clean up test data? (y/n): ")
    if response.lower() in ['y', 'yes']:
        cleanup_test_data()
    else:
        print("ℹ️ Test data left in database for inspection")
