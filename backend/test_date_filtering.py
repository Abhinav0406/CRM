#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone

def test_date_filtering():
    print("=== Testing Date Filtering Logic ===")
    
    # Test the date calculation logic
    end_date = timezone.now()
    print(f"Current time: {end_date}")
    
    # Test different filter types
    filter_types = ['today', 'yesterday', 'last7days', 'last30days', 'thisWeek', 'thisMonth', 'lastMonth']
    
    for filter_type in filter_types:
        print(f"\n--- Testing {filter_type} ---")
        
        # Initialize end_date_filter for all cases
        end_date_filter = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        if filter_type == 'today':
            start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif filter_type == 'yesterday':
            start_date = (end_date - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            end_date_filter = (end_date - timedelta(days=1)).replace(hour=23, minute=59, second=59, microsecond=999999)
        elif filter_type == 'last7days':
            start_date = end_date - timedelta(days=7)
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif filter_type == 'last30days':
            start_date = end_date - timedelta(days=30)
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif filter_type == 'thisWeek':
            # Start of current week (Monday)
            day_of_week = end_date.weekday()
            start_date = end_date - timedelta(days=day_of_week)
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif filter_type == 'thisMonth':
            # Start of current month
            start_date = end_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif filter_type == 'lastMonth':
            # Start of last month
            if end_date.month == 1:
                start_date = end_date.replace(year=end_date.year-1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                start_date = end_date.replace(month=end_date.month-1, day=1, hour=0, minute=0, second=0, microsecond=0)
            # End of last month
            if end_date.month == 1:
                end_date_filter = end_date.replace(year=end_date.year-1, month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)
            else:
                end_date_filter = end_date.replace(month=end_date.month-1, day=1) - timedelta(days=1)
                end_date_filter = end_date_filter.replace(hour=23, minute=59, second=59, microsecond=999999)
        else:
            # Default to today
            start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        print(f"  Start Date: {start_date}")
        print(f"  End Date: {end_date_filter}")
        print(f"  Duration: {(end_date_filter - start_date).days} days")
        
        # Test with sample data dates
        sample_dates = [
            end_date,  # today
            end_date - timedelta(days=1),  # yesterday
            end_date - timedelta(days=5),  # 5 days ago
            end_date - timedelta(days=15),  # 15 days ago
            end_date - timedelta(days=35),  # 35 days ago
        ]
        
        for sample_date in sample_dates:
            is_in_range = start_date <= sample_date <= end_date_filter
            print(f"    {sample_date.strftime('%Y-%m-%d')}: {'✓' if is_in_range else '✗'}")

if __name__ == "__main__":
    test_date_filtering()
