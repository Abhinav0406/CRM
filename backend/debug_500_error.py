#!/usr/bin/env python
"""
Script to debug the 500 error in team member creation.
"""
import os
import sys
import django
import traceback

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User, TeamMember
from apps.stores.models import Store
from apps.users.serializers import TeamMemberCreateSerializer
from rest_framework.test import APIRequestFactory

def debug_500_error():
    """Debug the 500 error in team member creation."""
    
    print("=== Debugging 500 Error ===")
    
    # Get a business admin user
    user = User.objects.filter(role='business_admin', is_active=True).first()
    if not user:
        print("No business admin found!")
        return
    
    print(f"Using user: {user.username}")
    print(f"User tenant: {user.tenant}")
    
    # Get stores for the tenant
    stores = Store.objects.filter(tenant=user.tenant)
    print(f"Available stores: {[s.name for s in stores]}")
    
    # Create request context
    factory = APIRequestFactory()
    request = factory.post('/api/auth/team-members/')
    request.user = user
    
    # Test data
    test_data = {
        "username": "testuser999",
        "email": "test999@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "role": "inhouse_sales",
        "phone": "1234567890",
        "address": "Test Address",
        "store": stores.first().id if stores.exists() else None
    }
    
    print(f"\nTest data: {test_data}")
    
    try:
        # Test the serializer
        serializer = TeamMemberCreateSerializer(data=test_data, context={'request': request})
        
        if serializer.is_valid():
            print("✅ Serializer is valid!")
            print(f"Validated data: {serializer.validated_data}")
            
            # Try to create the team member
            try:
                team_member = serializer.save()
                print(f"✅ Successfully created team member: {team_member}")
                print(f"User: {team_member.user}")
                print(f"User tenant: {team_member.user.tenant}")
                print(f"User store: {team_member.user.store}")
                
                # Clean up
                team_member.user.delete()
                print("✅ Cleaned up test data")
                
            except Exception as e:
                print(f"❌ Error creating team member: {e}")
                print("Full traceback:")
                traceback.print_exc()
        else:
            print("❌ Serializer is not valid!")
            print("Errors:", serializer.errors)
            
    except Exception as e:
        print(f"❌ Error with serializer: {e}")
        print("Full traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    debug_500_error() 