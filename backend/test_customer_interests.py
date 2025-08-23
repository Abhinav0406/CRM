#!/usr/bin/env python
"""
Simple test to verify customer interests are being updated correctly
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
from apps.users.models import User

def test_customer_interests():
    """Test that customer interests are being updated correctly"""
    print("🧪 Testing Customer Interests Update...")
    
    try:
        # Get the real user
        user = User.objects.get(username='das')
        print(f"✅ Found user: {user.username}")
        
        # Find a customer with interests
        customer = Client.objects.filter(tenant=user.tenant).first()
        if not customer:
            print("❌ No customers found")
            return
            
        print(f"✅ Testing with customer: {customer.full_name}")
        
        # Check current interests
        interests = customer.interests.all()
        print(f"✅ Current interests: {interests.count()}")
        for interest in interests:
            print(f"   - {interest.category.name}: {interest.product.name} (₹{interest.revenue})")
        
        # Test data for updating interests
        update_data = [
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
            },
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
        
        # Convert to JSON strings
        customer_interests_input = [json.dumps(interest) for interest in update_data]
        
        print(f"📝 Update data: {customer_interests_input}")
        
        # Update the customer
        from apps.clients.serializers import ClientSerializer
        context = {'request': type('MockRequest', (), {'user': user})()}
        
        update_data_dict = {
            'customer_interests_input': customer_interests_input
        }
        
        serializer = ClientSerializer(customer, data=update_data_dict, context=context, partial=True)
        if serializer.is_valid():
            updated_customer = serializer.save()
            print(f"✅ Customer updated successfully")
            
            # Check updated interests
            updated_interests = updated_customer.interests.all()
            print(f"✅ Updated interests: {updated_interests.count()}")
            for interest in updated_interests:
                print(f"   - {interest.category.name}: {interest.product.name} (₹{interest.revenue})")
                
            if updated_interests.count() == 2:
                print("🎉 SUCCESS: Customer interests updated correctly!")
            else:
                print(f"❌ FAILURE: Expected 2 interests, got {updated_interests.count()}")
                
        else:
            print("❌ Update validation failed:")
            print(serializer.errors)
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_customer_interests()
