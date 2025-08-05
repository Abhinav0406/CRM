#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.stores.models import Store
from apps.sales.models import Sale, SalesPipeline
from apps.clients.models import Client
from apps.users.models import User
from decimal import Decimal
from django.db.models import Sum

def debug_store_data():
    print("=== DEBUGGING STORE DATA ===")
    
    # Get all stores
    stores = Store.objects.all()
    print(f"Total stores found: {stores.count()}")
    
    for store in stores:
        print(f"\n--- Store: {store.name} (ID: {store.id}) ---")
        
        # Check clients in this store
        clients = Client.objects.filter(store=store)
        print(f"  Clients in store: {clients.count()}")
        
        # Check sales for this store
        sales = Sale.objects.filter(client__store=store)
        print(f"  Total sales: {sales.count()}")
        
        if sales.count() > 0:
            total_revenue = sales.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            print(f"  Total revenue: ₹{total_revenue}")
        
        # Check pipeline for this store
        pipelines = SalesPipeline.objects.filter(client__store=store)
        print(f"  Total pipelines: {pipelines.count()}")
        
        closed_won_pipelines = pipelines.filter(stage='closed_won')
        print(f"  Closed won pipelines: {closed_won_pipelines.count()}")
        
        if closed_won_pipelines.count() > 0:
            closed_won_revenue = closed_won_pipelines.aggregate(total=Sum('actual_value'))['total'] or Decimal('0.00')
            print(f"  Closed won revenue: ₹{closed_won_revenue}")
        
        # Check recent sales (last 30 days)
        from django.utils import timezone
        from datetime import timedelta
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        recent_sales = sales.filter(created_at__gte=start_date, created_at__lte=end_date)
        print(f"  Recent sales (30 days): {recent_sales.count()}")
        
        if recent_sales.count() > 0:
            recent_revenue = recent_sales.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            print(f"  Recent revenue: ₹{recent_revenue}")

if __name__ == "__main__":
    debug_store_data() 