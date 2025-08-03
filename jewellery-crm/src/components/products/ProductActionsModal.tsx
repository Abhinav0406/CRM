'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api-service';
import { Loader2, X, Edit, Trash2, Eye, Copy, Archive } from 'lucide-react';

interface ProductActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: any;
  action: 'view' | 'edit' | 'delete' | null;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  category: string;
  brand: string;
  cost_price: number;
  selling_price: number;
  discount_price: number;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  weight: number;
  dimensions: string;
  material: string;
  color: string;
  size: string;
  status: string;
  is_featured: boolean;
  is_bestseller: boolean;
}

export default function ProductActionsModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  product, 
  action 
}: ProductActionsModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    cost_price: 0,
    selling_price: 0,
    discount_price: 0,
    quantity: 0,
    min_quantity: 1,
    max_quantity: 100,
    weight: 0,
    dimensions: '',
    material: '',
    color: '',
    size: '',
    status: 'active',
    is_featured: false,
    is_bestseller: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && product) {
      fetchCategories();
      if (action === 'edit') {
        setFormData({
          name: product.name || '',
          sku: product.sku || '',
          description: product.description || '',
          category: product.category?.toString() || '',
          brand: product.brand || '',
          cost_price: product.cost_price || 0,
          selling_price: product.selling_price || 0,
          discount_price: product.discount_price || 0,
          quantity: product.quantity || 0,
          min_quantity: product.min_quantity || 1,
          max_quantity: product.max_quantity || 100,
          weight: product.weight || 0,
          dimensions: product.dimensions || '',
          material: product.material || '',
          color: product.color || '',
          size: product.size || '',
          status: product.status || 'active',
          is_featured: product.is_featured || false,
          is_bestseller: product.is_bestseller || false,
        });
      }
    }
  }, [isOpen, product, action]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getProductCategories();
      if (response.success) {
        const data = response.data as any;
        setCategories(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productData = {
        ...formData,
        category: formData.category ? parseInt(formData.category) : undefined,
        cost_price: parseFloat(formData.cost_price.toString()),
        selling_price: parseFloat(formData.selling_price.toString()),
        discount_price: parseFloat(formData.discount_price.toString()),
        quantity: parseInt(formData.quantity.toString()),
        min_quantity: parseInt(formData.min_quantity.toString()),
        max_quantity: parseInt(formData.max_quantity.toString()),
        weight: parseFloat(formData.weight.toString()),
      };

      const response = await apiService.updateProduct(product.id.toString(), productData);
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      setError('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.deleteProduct(product.id.toString());
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
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

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            {action === 'view' && 'View Product'}
            {action === 'edit' && 'Edit Product'}
            {action === 'delete' && 'Delete Product'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {action === 'view' && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Product Name</Label>
                    <p className="font-medium">{product.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">SKU</Label>
                    <p className="font-medium">{product.sku}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Category</Label>
                    <p className="font-medium">{product.category_name || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Brand</Label>
                    <p className="font-medium">{product.brand || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Pricing & Inventory</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Selling Price</Label>
                    <p className="font-medium">{formatCurrency(product.selling_price)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Cost Price</Label>
                    <p className="font-medium">{formatCurrency(product.cost_price)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Quantity</Label>
                    <p className="font-medium">{product.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Status</Label>
                    <Badge variant={getStatusBadgeVariant(product.status)}>
                      {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {product.description && (
              <div>
                <Label className="text-sm text-gray-600">Description</Label>
                <p className="mt-1">{product.description}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => onClose()}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {action === 'edit' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Enter SKU"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Enter brand"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="cost_price"
                    type="text"
                    value={formData.cost_price === 0 ? '' : formData.cost_price.toString()}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      handleInputChange('cost_price', value ? parseFloat(value) : 0);
                    }}
                    placeholder="0.00"
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="selling_price">Selling Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="selling_price"
                    type="text"
                    value={formData.selling_price === 0 ? '' : formData.selling_price.toString()}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      handleInputChange('selling_price', value ? parseFloat(value) : 0);
                    }}
                    placeholder="0.00"
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_price">Discount Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="discount_price"
                    type="text"
                    value={formData.discount_price === 0 ? '' : formData.discount_price.toString()}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      handleInputChange('discount_price', value ? parseFloat(value) : 0);
                    }}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_quantity">Min Quantity</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => handleInputChange('min_quantity', parseInt(e.target.value) || 1)}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_quantity">Max Quantity</Label>
                <Input
                  id="max_quantity"
                  type="number"
                  value={formData.max_quantity}
                  onChange={(e) => handleInputChange('max_quantity', parseInt(e.target.value) || 100)}
                  placeholder="100"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => handleInputChange('material', e.target.value)}
                  placeholder="e.g., Gold, Silver, Platinum"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., Yellow, White, Rose"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (g)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  placeholder="e.g., 18K, 22K"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="e.g., 10x5x2 cm"
                />
              </div>
            </div>

            {/* Status and Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product Features</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                    />
                    <Label htmlFor="is_featured">Featured Product</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_bestseller"
                      checked={formData.is_bestseller}
                      onCheckedChange={(checked) => handleInputChange('is_bestseller', checked)}
                    />
                    <Label htmlFor="is_bestseller">Best Seller</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {action === 'delete' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Delete Product</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Product'
                )}
              </Button>
              <Button
                onClick={onClose}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 