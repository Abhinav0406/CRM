#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.announcements.models import Announcement, TeamMessage
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.stores.models import Store
from django.utils import timezone
from datetime import timedelta

def add_sample_announcements():
    """Add sample announcements and team messages for testing"""
    
    print("=== Adding Sample Announcements ===")
    
    try:
        # Get first tenant
        tenant = Tenant.objects.first()
        if not tenant:
            print("❌ No tenant found")
            return
        
        print(f"Tenant: {tenant.name}")
        
        # Get or create a user for announcements
        user = User.objects.filter(tenant=tenant).first()
        if not user:
            print("❌ No user found")
            return
        
        # Get or create a store
        store = Store.objects.filter(tenant=tenant).first()
        if not store:
            print("Creating sample store...")
            store = Store.objects.create(
                name="Main Store",
                code="MS001",
                address="123 Main Street",
                city="Mumbai",
                state="Maharashtra",
                timezone="Asia/Kolkata",
                tenant=tenant,
                is_active=True
            )
            print("✅ Created sample store")
        
        # Assign store to user if not already assigned
        if not user.store:
            user.store = store
            user.save()
            print(f"✅ Assigned store {store.name} to user {user.username}")
        
        # Clear existing announcements
        Announcement.objects.filter(tenant=tenant).delete()
        TeamMessage.objects.filter(tenant=tenant).delete()
        
        # Sample announcements
        announcements_data = [
            {
                'title': 'New Product Launch - Diamond Collection',
                'content': 'We are excited to announce the launch of our new diamond collection! This premium collection includes engagement rings, necklaces, and earrings. All sales reps should familiarize themselves with the new products and their features.',
                'announcement_type': 'team_specific',
                'priority': 'high',
                'is_pinned': True,
                'requires_acknowledgment': True,
                'target_roles': ['sales', 'inhouse_sales'],
                'publish_at': timezone.now() - timedelta(hours=2),
            },
            {
                'title': 'Monthly Sales Target Update',
                'content': 'Great news! We have achieved 85% of our monthly sales target. Let\'s push for the remaining 15% in the last week. Focus on high-value customers and premium products.',
                'announcement_type': 'team_specific',
                'priority': 'medium',
                'is_pinned': False,
                'requires_acknowledgment': False,
                'target_roles': ['sales', 'inhouse_sales'],
                'publish_at': timezone.now() - timedelta(hours=1),
            },
            {
                'title': 'Store Maintenance Notice',
                'content': 'The store will undergo maintenance on Saturday from 2 PM to 6 PM. During this time, we will be open but with limited services. Please inform customers about potential delays.',
                'announcement_type': 'store_specific',
                'priority': 'medium',
                'is_pinned': False,
                'requires_acknowledgment': False,
                'publish_at': timezone.now() - timedelta(days=1),
            },
            {
                'title': 'Customer Feedback System Update',
                'content': 'We have implemented a new customer feedback system. All sales reps should collect customer feedback after each sale. The feedback will help us improve our services.',
                'announcement_type': 'system_wide',
                'priority': 'low',
                'is_pinned': False,
                'requires_acknowledgment': False,
                'publish_at': timezone.now() - timedelta(days=2),
            },
            {
                'title': 'Urgent: Security Alert',
                'content': 'Please be extra vigilant about security today. Report any suspicious activity immediately to management. This is a precautionary measure.',
                'announcement_type': 'store_specific',
                'priority': 'urgent',
                'is_pinned': True,
                'requires_acknowledgment': True,
                'publish_at': timezone.now() - timedelta(minutes=30),
            },
        ]
        
        created_announcements = 0
        for announcement_data in announcements_data:
            announcement = Announcement.objects.create(
                tenant=tenant,
                author=user,
                **announcement_data
            )
            
            # Add target stores if store-specific
            if announcement_data['announcement_type'] == 'store_specific':
                announcement.target_stores.add(store)
            
            created_announcements += 1
            print(f"✅ Created announcement: {announcement.title}")
        
        # Sample team messages
        team_messages_data = [
            {
                'subject': 'Customer Visit Follow-up',
                'content': 'Please ensure all customer visits are properly documented in the system. This helps us track customer preferences and improve our service.',
                'message_type': 'customer',
                'is_urgent': False,
                'requires_response': False,
            },
            {
                'subject': 'Sales Training Session',
                'content': 'We will have a sales training session tomorrow at 10 AM. All sales reps are required to attend. Topics include new product features and sales techniques.',
                'message_type': 'task',
                'is_urgent': True,
                'requires_response': True,
            },
            {
                'subject': 'Customer Complaint Resolution',
                'content': 'A customer has raised a complaint about product quality. Please review your sales process and ensure all products are properly checked before delivery.',
                'message_type': 'urgent',
                'is_urgent': True,
                'requires_response': True,
            },
            {
                'subject': 'Team Meeting Tomorrow',
                'content': 'We will have our weekly team meeting tomorrow at 9 AM. Please prepare your weekly reports and be ready to discuss any issues.',
                'message_type': 'general',
                'is_urgent': False,
                'requires_response': False,
            },
        ]
        
        created_messages = 0
        for message_data in team_messages_data:
            message = TeamMessage.objects.create(
                tenant=tenant,
                sender=user,
                store=store,
                **message_data
            )
            
            # Add all sales users as recipients
            sales_users = User.objects.filter(tenant=tenant, role__in=['sales', 'inhouse_sales'])
            message.recipients.set(sales_users)
            
            created_messages += 1
            print(f"✅ Created team message: {message.subject}")
        
        print(f"\n=== Summary ===")
        print(f"✅ Created {created_announcements} announcements")
        print(f"✅ Created {created_messages} team messages")
        print(f"✅ Total announcements in database: {Announcement.objects.filter(tenant=tenant).count()}")
        print(f"✅ Total team messages in database: {TeamMessage.objects.filter(tenant=tenant).count()}")
        
        # Debug filtering
        print("\n=== Debugging Filtering ===")
        print(f"User: {user.username}")
        print(f"User store: {user.store}")
        print(f"User tenant: {user.tenant}")
        
        # Test the filtering logic
        from django.db.models import Q
        queryset = Announcement.objects.filter(is_active=True)
        print(f"Base announcements: {queryset.count()}")
        
        if user.tenant:
            queryset = queryset.filter(tenant=user.tenant)
            print(f"After tenant filter: {queryset.count()}")
        
        if user.store:
            store_filtered = queryset.filter(
                Q(target_stores__isnull=True) |  # System-wide
                Q(target_stores=user.store) |    # Store-specific
                Q(author__store=user.store)      # Created by same store members
            ).distinct()
            print(f"After store filter: {store_filtered.count()}")
            
            for ann in store_filtered:
                print(f"  - {ann.title} (Type: {ann.announcement_type}, Author Store: {ann.author.store})")
        
    except Exception as e:
        print(f"❌ Error adding sample announcements: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    add_sample_announcements() 