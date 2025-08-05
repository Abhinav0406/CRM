# Testing Scoped Visibility Implementation

## Backend Testing

### 1. Start the Django Backend
```bash
cd backend
python manage.py runserver
```

### 2. Run the Scoped Visibility Tests
```bash
cd backend
python manage.py test apps.users.tests.test_scoped_visibility
```

## Frontend Testing

### 1. Start the Next.js Frontend
```bash
cd jewellery-crm
npm run dev
```

### 2. Test Different User Roles

#### Platform Admin / Business Admin
1. Log in with a `platform_admin` or `business_admin` user
2. Navigate to `/business-admin/products`
3. **Expected**: 
   - Scope indicator shows "All Data"
   - Can see all products across all stores
   - No restrictions on data access

#### Store Manager
1. Log in with a `manager` user (must have `store_id` assigned)
2. Navigate to `/business-admin/products`
3. **Expected**:
   - Scope indicator shows "Store Data"
   - Can only see products from their assigned store
   - Data is filtered by `store_id`

#### Salesperson (In-house Sales / Tele-calling)
1. Log in with an `inhouse_sales` or `tele_calling` user
2. Navigate to `/sales/pipeline`
3. **Expected**:
   - Scope indicator shows "My Data"
   - Can only see their own sales pipeline entries
   - Data is filtered by `sales_representative = current_user_id`

### 3. Test API Endpoints

#### Check Network Requests
1. Open browser developer tools (F12)
2. Go to Network tab
3. Navigate between pages
4. **Expected**:
   - For salespeople: API calls to `/api/sales/pipeline/my/`
   - For managers: API calls to `/api/products/` (backend middleware handles filtering)
   - For admins: API calls to regular endpoints (no restrictions)

### 4. Verify Backend Middleware

#### Check Django Logs
1. Monitor the Django server console
2. **Expected**:
   - No errors related to scoped visibility
   - Queryset filtering working correctly
   - User scope being applied properly

## Manual Verification Steps

### 1. Database Verification
```sql
-- Check user roles and store assignments
SELECT username, role, store_id FROM users_user WHERE is_active = true;

-- Check sales pipeline assignments
SELECT sp.title, sp.sales_representative_id, u.username 
FROM sales_salespipeline sp 
JOIN users_user u ON sp.sales_representative_id = u.id;
```

### 2. API Response Verification
```bash
# Test with different user tokens
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/sales/pipeline/
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/sales/pipeline/my/
```

## Expected Behavior

### Platform Admin / Business Admin
- **Scope**: All Data
- **API Endpoints**: Regular endpoints
- **Data Access**: Full access to all data within tenant
- **UI Indicator**: "All Data" badge

### Store Manager
- **Scope**: Store Data
- **API Endpoints**: Regular endpoints (backend filters by store)
- **Data Access**: Only data from their assigned store
- **UI Indicator**: "Store Data" badge

### Salesperson
- **Scope**: Own Data
- **API Endpoints**: "My" endpoints (e.g., `/api/sales/pipeline/my/`)
- **Data Access**: Only their own data
- **UI Indicator**: "My Data" badge

## Troubleshooting

### Common Issues

1. **Scope indicator not showing**: Check if `ScopeIndicator` component is imported and used
2. **Wrong data being shown**: Verify user role and store assignment in database
3. **API errors**: Check Django middleware is properly registered in settings
4. **Frontend not using scoped endpoints**: Verify `useScopedVisibility` hook is being used

### Debug Commands

```bash
# Check Django middleware
python manage.py shell
>>> from apps.users.middleware import ScopedVisibilityMiddleware
>>> middleware = ScopedVisibilityMiddleware()

# Check user scope
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> user = User.objects.get(username='test_user')
>>> print(f"Role: {user.role}, Store: {user.store_id}")
```

## Success Criteria

✅ Backend tests pass  
✅ Frontend shows correct scope indicators  
✅ Data filtering works per user role  
✅ API endpoints return scoped data  
✅ No errors in browser console  
✅ No errors in Django logs  
✅ UI reflects user's access level 