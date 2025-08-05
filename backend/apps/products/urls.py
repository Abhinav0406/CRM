from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    # Public Store URLs (no authentication required)
    path('public/<str:tenant_code>/products/', views.PublicProductListView.as_view(), name='public-product-list'),
    path('public/<str:tenant_code>/categories/', views.PublicCategoryListView.as_view(), name='public-category-list'),
    path('public/<str:tenant_code>/products/<int:pk>/', views.PublicProductDetailView.as_view(), name='public-product-detail'),
    path('public/<str:tenant_code>/categories/<int:category_id>/products/', views.PublicProductsByCategoryView.as_view(), name='public-products-by-category'),
    
    # Product URLs
    path('list/', views.ProductListView.as_view(), name='product-list'),
    path('create/', views.ProductCreateView.as_view(), name='product-create'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('<int:pk>/update/', views.ProductUpdateView.as_view(), name='product-update'),
    path('<int:pk>/delete/', views.ProductDeleteView.as_view(), name='product-delete'),
    path('by-category/<int:category_id>/', views.ProductsByCategoryView.as_view(), name='products-by-category'),
    
    # Category URLs
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/create/', views.CategoryCreateView.as_view(), name='category-create'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('categories/<int:pk>/update/', views.CategoryUpdateView.as_view(), name='category-update'),
    path('categories/<int:pk>/delete/', views.CategoryDeleteView.as_view(), name='category-delete'),
    path('categories/debug/', views.CategoryDebugView.as_view(), name='category-debug'),
    path('debug/', views.ProductsDebugView.as_view(), name='products-debug'),
    
    # Product Variant URLs
    path('<int:product_id>/variants/', views.ProductVariantListView.as_view(), name='product-variant-list'),
    path('<int:product_id>/variants/create/', views.ProductVariantCreateView.as_view(), name='product-variant-create'),
    path('variants/<int:pk>/', views.ProductVariantDetailView.as_view(), name='product-variant-detail'),
    path('variants/<int:pk>/update/', views.ProductVariantUpdateView.as_view(), name='product-variant-update'),
    path('variants/<int:pk>/delete/', views.ProductVariantDeleteView.as_view(), name='product-variant-delete'),
    
    # Stats
    path('stats/', views.ProductStatsView.as_view(), name='product-stats'),
    
    # Import
    path('import/', views.ProductImportView.as_view(), name='product-import'),
] 