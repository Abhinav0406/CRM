'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter, MoreHorizontal, Package, Tag, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddProductModal from '@/components/products/AddProductModal';
import CategoriesModal from '@/components/products/CategoriesModal';
import ImportModal from '@/components/products/ImportModal';
import ProductActionsModal from '@/components/products/ProductActionsModal';

interface Product {
  id: number;
  name: string;
  sku: string;
  category?: number;
  category_name?: string;
  brand?: string;
  cost_price: number;
  selling_price: number;
  discount_price?: number;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  weight?: number;
  dimensions?: string;
  material?: string;
  color?: string;
  size?: string;
  status: string;
  is_featured: boolean;
  is_bestseller: boolean;
  main_image?: string;
  additional_images: string[];
  created_at: string;
  updated_at: string;
  is_in_stock?: boolean;
  is_low_stock?: boolean;
  current_price?: number;
  profit_margin?: number;
  variant_count?: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  product_count: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAction, setSelectedAction] = useState<'view' | 'edit' | 'delete' | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts({
        page: currentPage,
        search: searchTerm || undefined,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
      });
      
      if (response.success) {
        const data = response.data as any;
        setProducts(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getProductCategories();
      if (response.success) {
        const data = response.data as any;
        setCategories(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'out_of_stock':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddProductSuccess = () => {
    fetchProducts();
    fetchCategories();
  };

  const handleProductAction = (product: Product, action: 'view' | 'edit' | 'delete') => {
    setSelectedProduct(product);
    setSelectedAction(action);
    setIsActionsModalOpen(true);
  };

  const handleActionsModalClose = () => {
    setIsActionsModalOpen(false);
    setSelectedProduct(null);
    setSelectedAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Products</h1>
          <p className="text-text-secondary mt-1">Manage your jewelry inventory and catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Package className="w-4 h-4" />
            Import
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setIsCategoriesModalOpen(true)}
          >
            <Tag className="w-4 h-4" />
            Categories
          </Button>
          <Button 
            className="btn-primary flex items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Products</p>
                <p className="text-2xl font-bold text-text-primary">{products.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">📦</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Categories</p>
                <p className="text-2xl font-bold text-text-primary">{categories.length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-semibold">🏷️</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Low Stock</p>
                <p className="text-2xl font-bold text-text-primary">
                  {products.filter(p => p.quantity <= p.min_quantity).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-semibold">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Value</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatCurrency(products.reduce((sum, p) => sum + (p.selling_price * p.quantity), 0))}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-semibold">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Categories */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Product Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text-primary">{category.name}</h3>
                  <Badge variant="outline">{category.product_count} products</Badge>
                </div>
                {category.description && (
                  <p className="text-sm text-text-secondary">{category.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => {
                // TODO: Implement advanced filters
                alert('Advanced filters coming soon!');
              }}
            >
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-text-secondary">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-text-secondary mb-2">No products found</div>
              <Button 
                variant="outline"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add your first product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-text-primary">{product.name}</div>
                          <div className="text-sm text-text-secondary">SKU: {product.sku}</div>
                          {product.material && (
                            <div className="text-xs text-text-secondary">
                              {product.material} {product.color && `(${product.color})`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-text-primary">{product.category_name || 'Uncategorized'}</div>
                          {product.brand && (
                            <div className="text-sm text-text-secondary">{product.brand}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-text-primary">
                            {formatCurrency(product.selling_price)}
                          </div>
                          <div className="text-sm text-text-secondary">
                            Cost: {formatCurrency(product.cost_price)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-text-primary">{product.quantity}</div>
                          <div className="text-sm text-text-secondary">
                            Min: {product.min_quantity}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusBadgeVariant(product.status)}>
                          {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {formatDate(product.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleProductAction(product, 'view')}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleProductAction(product, 'edit')}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleProductAction(product, 'delete')}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddProductSuccess}
      />
      
      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        onSuccess={handleAddProductSuccess}
      />
      
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleAddProductSuccess}
      />
      
      <ProductActionsModal
        isOpen={isActionsModalOpen}
        onClose={handleActionsModalClose}
        onSuccess={handleAddProductSuccess}
        product={selectedProduct}
        action={selectedAction}
      />
    </div>
  );
}