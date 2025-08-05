from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import timedelta
import csv
import io
from decimal import Decimal

from .models import Product, Category, ProductVariant
from .serializers import ProductSerializer, ProductListSerializer, ProductDetailSerializer, CategorySerializer, ProductVariantSerializer
from apps.users.permissions import IsRoleAllowed


class CustomProductPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager', 'inhouse_sales', 'tele_calling', 'marketing'])]
    pagination_class = CustomProductPagination
    
    def get_queryset(self):
        queryset = Product.objects.filter(tenant=self.request.user.tenant)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Search by name or SKU
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(sku__icontains=search)
            )
        
        # Filter by stock level
        stock_filter = self.request.query_params.get('stock')
        if stock_filter == 'low':
            queryset = queryset.filter(quantity__lte=F('min_quantity'))
        elif stock_filter == 'out':
            queryset = queryset.filter(quantity=0)
        
        return queryset.order_by('-created_at')


class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager'])]
    parser_classes = [MultiPartParser, FormParser]
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager', 'inhouse_sales', 'tele_calling', 'marketing'])]
    
    def get_queryset(self):
        return Product.objects.filter(tenant=self.request.user.tenant)


class ProductUpdateView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager'])]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return Product.objects.filter(tenant=self.request.user.tenant)


class ProductDeleteView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager'])]
    
    def get_queryset(self):
        return Product.objects.filter(tenant=self.request.user.tenant)


class ProductStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager', 'inhouse_sales', 'tele_calling', 'marketing'])]
    
    def get(self, request):
        tenant = request.user.tenant
        
        # Basic stats
        total_products = Product.objects.filter(tenant=tenant).count()
        active_products = Product.objects.filter(tenant=tenant, status='active').count()
        out_of_stock = Product.objects.filter(tenant=tenant, quantity=0).count()
        low_stock = Product.objects.filter(tenant=tenant, quantity__lte=F('min_quantity')).count()
        
        # Inventory value
        total_value = Product.objects.filter(tenant=tenant).aggregate(
            total=Sum(F('quantity') * F('cost_price'))
        )['total'] or 0
        
        # Category stats
        category_count = Category.objects.filter(tenant=tenant).count()
        
        # Recent activity
        recent_products = Product.objects.filter(
            tenant=tenant,
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        return Response({
            'total_products': total_products,
            'active_products': active_products,
            'out_of_stock': out_of_stock,
            'low_stock': low_stock,
            'total_value': float(total_value),
            'category_count': category_count,
            'recent_products': recent_products,
        })


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager', 'inhouse_sales', 'tele_calling', 'marketing'])]
    pagination_class = None  # Disable pagination for categories
    
    def get_queryset(self):
        # Temporarily return all categories for debugging
        return Category.objects.filter(tenant=self.request.user.tenant)


class CategoryCreateView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager'])]
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager', 'inhouse_sales', 'tele_calling', 'marketing'])]
    
    def get_queryset(self):
        return Category.objects.filter(tenant=self.request.user.tenant)


class CategoryUpdateView(generics.UpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager'])]
    
    def get_queryset(self):
        return Category.objects.filter(tenant=self.request.user.tenant)


class CategoryDeleteView(generics.DestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager'])]
    
    def get_queryset(self):
        return Category.objects.filter(tenant=self.request.user.tenant)


class ProductVariantListView(generics.ListAPIView):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager', 'inhouse_sales', 'tele_calling', 'marketing'])]
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return ProductVariant.objects.filter(
            product_id=product_id,
            product__tenant=self.request.user.tenant
        )


class ProductVariantCreateView(generics.CreateAPIView):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager'])]
    
    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        product = Product.objects.get(id=product_id, tenant=self.request.user.tenant)
        serializer.save(product=product)


class ProductVariantDetailView(generics.RetrieveAPIView):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager', 'inhouse_sales', 'tele_calling', 'marketing'])]
    
    def get_queryset(self):
        return ProductVariant.objects.filter(product__tenant=self.request.user.tenant)


class ProductVariantUpdateView(generics.UpdateAPIView):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager'])]
    
    def get_queryset(self):
        return ProductVariant.objects.filter(product__tenant=self.request.user.tenant)


class ProductVariantDeleteView(generics.DestroyAPIView):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager'])]
    
    def get_queryset(self):
        return ProductVariant.objects.filter(product__tenant=self.request.user.tenant)


class CategoryDebugView(APIView):
    """Debug view to check categories for current tenant"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        tenant = request.user.tenant
        categories = Category.objects.filter(tenant=tenant)
        return Response({
            'tenant': tenant.name,
            'categories_count': categories.count(),
            'categories': list(categories.values('id', 'name', 'is_active'))
        })


class ProductsDebugView(APIView):
    """Debug view to check products for current tenant"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        tenant = request.user.tenant
        products = Product.objects.filter(tenant=tenant)
        
        # Test the serializer
        serializer = ProductListSerializer(products, many=True)
        
        return Response({
            'tenant': tenant.name,
            'products_count': products.count(),
            'products': serializer.data,
            'gold_products': list(products.filter(category__name='Gold').values('id', 'name', 'category', 'category__name'))
        })


class ProductsByCategoryView(generics.ListAPIView):
    """Get products for a specific category"""
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager', 'inhouse_sales', 'tele_calling', 'marketing'])]
    pagination_class = None  # No pagination for category products
    
    def get_queryset(self):
        category_id = self.kwargs.get('category_id')
        return Product.objects.filter(
            tenant=self.request.user.tenant,
            category_id=category_id
        ).order_by('-created_at')


class ProductImportView(APIView):
    """
    Import products from CSV file.
    """
    permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles(['business_admin', 'manager', 'inhouse_sales'])]
    parser_classes = [MultiPartParser, FormParser]  # Add this line to handle file uploads
    
    def get(self, request):
        """Test endpoint to check if import view is accessible"""
        return Response({
            'success': True,
            'message': 'Import endpoint is accessible'
        })
    
    def post(self, request):
        try:
            print(f"Import request from user: {request.user.username}, tenant: {request.user.tenant}")
            print(f"Request FILES: {request.FILES}")
            print(f"Request content type: {request.content_type}")
            
            if 'file' not in request.FILES:
                return Response({
                    'success': False,
                    'message': 'No file uploaded'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            file = request.FILES['file']
            print(f"File received: {file.name}, size: {file.size}, content_type: {file.content_type}")
            
            if not file.name.endswith('.csv'):
                return Response({
                    'success': False,
                    'message': 'Please upload a CSV file'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Read CSV file
            try:
                decoded_file = file.read().decode('utf-8')
                csv_data = csv.DictReader(io.StringIO(decoded_file))
                print(f"CSV file read successfully, headers: {csv_data.fieldnames}")
            except Exception as e:
                print(f"Error reading CSV file: {str(e)}")
                return Response({
                    'success': False,
                    'message': f'Error reading CSV file: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            imported_count = 0
            errors = []
            
            for row_num, row in enumerate(csv_data, start=2):  # Start from 2 because row 1 is header
                try:
                    # Validate required fields
                    required_fields = ['name', 'sku', 'category', 'selling_price', 'cost_price']
                    missing_fields = []
                    for field in required_fields:
                        if not row.get(field):
                            missing_fields.append(field)
                    
                    if missing_fields:
                        errors.append(f"Row {row_num}: Missing required fields: {', '.join(missing_fields)}")
                        continue
                    
                    # Validate numeric fields
                    try:
                        selling_price = Decimal(row['selling_price'])
                        cost_price = Decimal(row['cost_price'])
                        quantity_str = row.get('quantity', '0')
                        quantity = int(quantity_str) if quantity_str.strip() else 0  # Default to 0 if empty or not provided
                    except (ValueError, TypeError) as e:
                        errors.append(f"Row {row_num}: Invalid numeric values - {str(e)}")
                        continue
                    
                    # Get or create category
                    category_name = row['category'].strip()
                    try:
                        category, created = Category.objects.get_or_create(
                            name=category_name,
                            tenant=request.user.tenant,
                            defaults={
                                'description': f'Category for {category_name}',
                                'is_active': True
                            }
                        )
                        if created:
                            print(f"Created new category: {category.name}")
                        else:
                            print(f"Using existing category: {category.name}")
                    except Exception as e:
                        print(f"Error creating/getting category: {str(e)}")
                        errors.append(f"Row {row_num}: Error with category '{category_name}' - {str(e)}")
                        continue
                    
                    # Check if SKU already exists (unique per tenant)
                    if Product.objects.filter(sku=row['sku'], tenant=request.user.tenant).exists():
                        errors.append(f"Row {row_num}: SKU '{row['sku']}' already exists in your tenant")
                        continue
                    
                    # Create product
                    try:
                        product = Product.objects.create(
                            name=row['name'].strip(),
                            sku=row['sku'].strip(),
                            category=category,
                            selling_price=selling_price,
                            cost_price=cost_price,
                            quantity=quantity,
                            description=row.get('description', '').strip(),
                            status='active',
                            tenant=request.user.tenant,
                            is_featured=False,
                            is_bestseller=False,
                            min_quantity=0,
                            max_quantity=999999,
                            weight=Decimal('0'),
                            dimensions='',
                            material='',
                            color='',
                            size='',
                            brand='',
                            main_image='',
                            additional_images=[],
                            meta_title='',
                            meta_description='',
                            tags=[]
                        )
                    except Exception as e:
                        print(f"Error creating product: {str(e)}")
                        errors.append(f"Row {row_num}: Error creating product - {str(e)}")
                        continue
                    
                    print(f"Successfully created product: {product.name} (SKU: {product.sku})")
                    imported_count += 1
                    
                except Exception as e:
                    print(f"Error processing row {row_num}: {str(e)}")
                    errors.append(f"Row {row_num}: {str(e)}")
                    continue
            
            if errors:
                return Response({
                    'success': False,
                    'message': f'Import completed with {len(errors)} errors',
                    'imported_count': imported_count,
                    'errors': errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'message': f'Successfully imported {imported_count} products',
                'imported_count': imported_count
            })
            
        except Exception as e:
            print(f"Import failed with error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'message': f'Import failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
