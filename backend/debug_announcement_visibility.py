#!/usr/bin/env python
import os
import sys
import django
from django.utils import timezone

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.announcements.models import Announcement, TeamMessage
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.stores.models import Store

def debug_announcement_visibility():
    """Debug why announcements are not visible"""
    
    print("=== Debugging Announcement Visibility ===")
    
    try:
        # Get tenant
        tenant = Tenant.objects.first()
        if not tenant:
            print("❌ No tenant found")
            return
        
        print(f"✅ Tenant: {tenant.name}")
        
        # Get all announcements
        all_announcements = Announcement.objects.filter(tenant=tenant)
        print(f"\n📊 Total announcements in database: {all_announcements.count()}")
        
        for ann in all_announcements:
            print(f"\n📢 Announcement: {ann.title}")
            print(f"   - ID: {ann.id}")
            print(f"   - Type: {ann.announcement_type}")
            print(f"   - Priority: {ann.priority}")
            print(f"   - Is Active: {ann.is_active}")
            print(f"   - Is Pinned: {ann.is_pinned}")
            print(f"   - Publish Date: {ann.publish_at}")
            print(f"   - Expires Date: {ann.expires_at}")
            print(f"   - Target Roles: {ann.target_roles}")
            print(f"   - Created: {ann.created_at}")
            
            # Check if it should be visible
            now = timezone.now()
            is_published = ann.publish_at <= now
            is_expired = ann.expires_at and ann.expires_at <= now
            
            print(f"   - Is Published: {is_published}")
            print(f"   - Is Expired: {is_expired}")
            print(f"   - Should be visible: {ann.is_active and is_published and not is_expired}")
        
        # Check what the API should return
        print(f"\n🔍 API Query Results:")
        
        # Simulate the API query
        now = timezone.now()
        visible_announcements = Announcement.objects.filter(
            is_active=True,
            publish_at__lte=now
        ).filter(
            tenant=tenant
        ).exclude(
            expires_at__lte=now
        ).distinct()
        
        print(f"✅ Visible announcements: {visible_announcements.count()}")
        
        for ann in visible_announcements:
            print(f"   - {ann.title} ({ann.priority})")
        
        # Check team messages
        print(f"\n📨 Team Messages:")
        messages = TeamMessage.objects.filter(tenant=tenant)
        print(f"✅ Total messages: {messages.count()}")
        
        for msg in messages:
            print(f"   - {msg.subject} ({msg.message_type})")
        
        # Check users
        users = User.objects.filter(tenant=tenant)
        print(f"\n👥 Users in tenant: {users.count()}")
        for user in users:
            print(f"   - {user.first_name} {user.last_name} ({user.role})")
        
        # Check stores
        stores = Store.objects.filter(tenant=tenant)
        print(f"\n🏪 Stores in tenant: {stores.count()}")
        for store in stores:
            print(f"   - {store.name} ({store.code})")
        
    except Exception as e:
        print(f"❌ Error debugging: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_announcement_visibility() 