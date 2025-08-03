"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "lucide-react";
import { apiService } from "@/lib/api-service";

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddCustomerModal({ open, onClose }: AddCustomerModalProps) {
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    birthDate: "",
    anniversaryDate: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "India",
    catchmentArea: "",
    community: "",
    motherTongue: "",
    reasonForVisit: "",
    leadSource: "",
    ageOfEndUser: "",
    savingScheme: "",
    nextFollowUpDate: "",
    nextFollowUpTime: "10:00",
    summaryNotes: "",
  });

  // State for dynamic interests
  const [interests, setInterests] = useState([
    {
      mainCategory: "",
      products: [{ product: "", revenue: "" }],
      preferences: {
        designSelected: false,
        wantsDiscount: false,
        checkingOthers: false,
        lessVariety: false,
        other: "",
      },
    },
  ]);

  // State for API data
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  // State for sales pipeline
  const [showPipelineSection, setShowPipelineSection] = useState(false);
  const [pipelineOpportunities, setPipelineOpportunities] = useState<any[]>([]);

  const addInterest = () => {
    setInterests([
      ...interests,
      {
        mainCategory: "",
        products: [{ product: "", revenue: "" }],
        preferences: {
          designSelected: false,
          wantsDiscount: false,
          checkingOthers: false,
          lessVariety: false,
          other: "",
        },
      },
    ]);
  };

  const addProductToInterest = (idx: number) => {
    setInterests((prev) => {
      const copy = [...prev];
      copy[idx].products.push({ product: "", revenue: "" });
      return copy;
    });
  };

  const removeProductFromInterest = (interestIdx: number, productIdx: number) => {
    setInterests((prev) => {
      const copy = [...prev];
      copy[interestIdx].products.splice(productIdx, 1);
      return copy;
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting customer data:', { formData, interests });
      
      // Prepare customer data
      const customerData = {
        first_name: formData.fullName.split(' ')[0] || formData.fullName,
        last_name: formData.fullName.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        date_of_birth: formData.birthDate,
        anniversary_date: formData.anniversaryDate,
        community: formData.community,
        mother_tongue: formData.motherTongue,
        reason_for_visit: formData.reasonForVisit,
        lead_source: formData.leadSource,
        age_of_end_user: formData.ageOfEndUser,
        saving_scheme: formData.savingScheme,
        catchment_area: formData.catchmentArea,
        next_follow_up: formData.nextFollowUpDate,
        next_follow_up_time: formData.nextFollowUpTime,
        summary_notes: formData.summaryNotes,
        customer_interests: interests.map(interest => JSON.stringify({
          category: interest.mainCategory,
          products: interest.products,
          preferences: interest.preferences
        }))
      };

      console.log('Sending customer data to API:', customerData);
      
      // Call API to create customer
      const response = await apiService.createClient(customerData);
      
      if (response.success) {
        console.log('Customer created successfully:', response.data);
        
        // Create sales pipeline opportunities if customer is interested
        if (showPipelineSection && pipelineOpportunities.length > 0) {
          await createPipelineOpportunities(response.data.id);
          alert(`✅ Customer created successfully! ${pipelineOpportunities.length} sales pipeline opportunity(ies) have been created.`);
        }
        
        // Check if follow-up date was provided and show appropriate message
        if (formData.nextFollowUpDate) {
          const time = formData.nextFollowUpTime || '10:00';
          alert(`Customer added successfully! A follow-up appointment has been scheduled for ${formData.nextFollowUpDate} at ${time}.`);
        } else {
          alert('Customer added successfully!');
        }
        
        onClose();
        // Reset form
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          birthDate: "",
          anniversaryDate: "",
          streetAddress: "",
          city: "",
          state: "",
          country: "India",
          catchmentArea: "",
          community: "",
          motherTongue: "",
          reasonForVisit: "",
          leadSource: "",
          ageOfEndUser: "",
          savingScheme: "",
          nextFollowUpDate: "",
          nextFollowUpTime: "10:00",
          summaryNotes: "",
        });
        setInterests([{
          mainCategory: "",
          products: [{ product: "", revenue: "" }],
          preferences: {
            designSelected: false,
            wantsDiscount: false,
            checkingOthers: false,
            lessVariety: false,
            other: "",
          },
        }]);
        setPipelineOpportunities([]);
        setShowPipelineSection(false);
      } else {
        console.error('Failed to create customer:', response);
        alert('Failed to add customer. Please try again.');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer. Please check the console for details.');
    }
  };

  const createPipelineOpportunities = async (customerId: number) => {
    try {
      for (const opportunity of pipelineOpportunities) {
        const pipelineData = {
          title: opportunity.title,
          client_id: customerId, // Changed from client to client_id
          sales_representative: 1, // Default to current user
          stage: 'lead',
          probability: opportunity.probability,
          expected_value: opportunity.expected_value,
          notes: opportunity.notes,
          next_action: opportunity.next_action,
          next_action_date: opportunity.next_action_date
        };
        
        console.log('Creating pipeline with data:', pipelineData);
        const response = await apiService.createSalesPipeline(pipelineData);
        if (response.success) {
          console.log('Pipeline opportunity created:', response.data);
        } else {
          console.error('Failed to create pipeline opportunity:', response);
          console.error('Response details:', response);
        }
      }
    } catch (error) {
      console.error('Error creating pipeline opportunities:', error);
    }
  };

  const generatePipelineOpportunities = () => {
    const opportunities: any[] = [];
    
    interests.forEach((interest, idx) => {
      if (interest.mainCategory && interest.products.length > 0) {
        const totalRevenue = interest.products.reduce((sum, product) => {
          return sum + (parseFloat(product.revenue) || 0);
        }, 0);
        
        if (totalRevenue > 0) {
          const categoryName = categories.find(cat => 
            cat.id?.toString() === interest.mainCategory || cat.name === interest.mainCategory
          )?.name || `Category ${interest.mainCategory}`;
          
          opportunities.push({
            title: `${formData.fullName} - ${categoryName} Opportunity`,
            probability: 50, // Default probability
            expected_value: totalRevenue,
            notes: `Generated from customer interest in ${categoryName}. Products: ${interest.products.map(p => p.product).join(', ')}`,
            next_action: 'Follow up with customer',
            next_action_date: formData.nextFollowUpDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        }
      }
    });
    
    setPipelineOpportunities(opportunities);
    setShowPipelineSection(true);
  };

  // Fetch categories, products, and dropdown options when modal opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          setLoading(true);
          console.log('Fetching data for AddCustomerModal...');
          
          // Fetch categories
          const categoriesResponse = await apiService.getProductCategories();
          console.log('Categories response:', categoriesResponse);
          if (categoriesResponse.success && categoriesResponse.data) {
            const categoriesData = Array.isArray(categoriesResponse.data) 
              ? categoriesResponse.data 
              : (categoriesResponse.data as any).results || (categoriesResponse.data as any).data || [];
            setCategories(categoriesData);
            console.log('Categories loaded:', categoriesData.length);
          }
          
          // Fetch products
          const productsResponse = await apiService.getProducts();
          console.log('Products response:', productsResponse);
          if (productsResponse.success && productsResponse.data) {
            const productsData = Array.isArray(productsResponse.data) 
              ? productsResponse.data 
              : (productsResponse.data as any).results || (productsResponse.data as any).data || [];
            setProducts(productsData);
            console.log('Products loaded:', productsData.length);
          }

          // Fetch dropdown options
          const dropdownResponse = await apiService.getCustomerDropdownOptions();
          console.log('Dropdown options response:', dropdownResponse);
          if (dropdownResponse.success && dropdownResponse.data) {
            setDropdownOptions(dropdownResponse.data);
            console.log('Dropdown options loaded:', dropdownResponse.data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Customer / Visit Log</DialogTitle>
          <DialogDescription>
            Enter customer details, track revenue opportunities, and convert leads to sales.
          </DialogDescription>
          {loading && <div className="text-sm text-blue-600 mt-2">Loading data...</div>}
        </DialogHeader>
        {/* Customer Details */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="font-semibold mb-2">Customer Details</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input 
                placeholder="e.g., Priya Sharma" 
                required 
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number (India) *</label>
              <Input 
                placeholder="+91 98XXXXXX00" 
                required 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                placeholder="e.g., priya.sharma@example.com" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Birth Date</label>
              <Input 
                type="date" 
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anniversary Date</label>
              <Input 
                type="date" 
                value={formData.anniversaryDate}
                onChange={(e) => handleInputChange('anniversaryDate', e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Address */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="font-semibold mb-2">Address</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <Input 
                placeholder="e.g., 123, Diamond Lane" 
                value={formData.streetAddress}
                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Input 
                placeholder="e.g., Mumbai" 
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent>
                  {dropdownOptions.states?.map((state: any) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="MH">Maharashtra</SelectItem>
                      <SelectItem value="TG">Telangana</SelectItem>
                      <SelectItem value="KA">Karnataka</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <Input value="India" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Catchment Area</label>
              <Input 
                placeholder="e.g., South Mumbai, Bandra West" 
                value={formData.catchmentArea}
                onChange={(e) => handleInputChange('catchmentArea', e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Demographics & Visit */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="font-semibold mb-2">Demographics & Visit</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Community</label>
              <Select value={formData.community} onValueChange={(value) => handleInputChange('community', value)}>
                <SelectTrigger><SelectValue placeholder="Select Community" /></SelectTrigger>
                <SelectContent>
                  {dropdownOptions.communities?.map((community: any) => (
                    <SelectItem key={community.value} value={community.value}>
                      {community.label}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="hindu">Hindu</SelectItem>
                      <SelectItem value="muslim">Muslim</SelectItem>
                      <SelectItem value="sikh">Sikh</SelectItem>
                      <SelectItem value="christian">Christian</SelectItem>
                      <SelectItem value="jain">Jain</SelectItem>
                      <SelectItem value="buddhist">Buddhist</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mother Tongue / Sub-community</label>
              <Input 
                placeholder="e.g., Gujarati, Marwari Jain" 
                value={formData.motherTongue}
                onChange={(e) => handleInputChange('motherTongue', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason for Visit</label>
              <Select value={formData.reasonForVisit} onValueChange={(value) => handleInputChange('reasonForVisit', value)}>
                <SelectTrigger><SelectValue placeholder="Select Reason" /></SelectTrigger>
                <SelectContent>
                  {dropdownOptions.reasons_for_visit?.map((reason: any) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="inquiry">Inquiry</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lead Source</label>
              <Select value={formData.leadSource} onValueChange={(value) => handleInputChange('leadSource', value)}>
                <SelectTrigger><SelectValue placeholder="Select Source" /></SelectTrigger>
                <SelectContent>
                  {dropdownOptions.lead_sources?.map((source: any) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="walkin">Walk-in</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age of End-User</label>
              <Select value={formData.ageOfEndUser} onValueChange={(value) => handleInputChange('ageOfEndUser', value)}>
                <SelectTrigger><SelectValue placeholder="Select Age Group" /></SelectTrigger>
                <SelectContent>
                  {dropdownOptions.age_groups?.map((ageGroup: any) => (
                    <SelectItem key={ageGroup.value} value={ageGroup.value}>
                      {ageGroup.label}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="26-35">26-35</SelectItem>
                      <SelectItem value="36-50">36-50</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Saving Scheme</label>
              <Select value={formData.savingScheme} onValueChange={(value) => handleInputChange('savingScheme', value)}>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  {dropdownOptions.saving_schemes?.map((scheme: any) => (
                    <SelectItem key={scheme.value} value={scheme.value}>
                      {scheme.label}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Customer Interests (dynamic) */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Customer Interests</div>
            <Button variant="outline" size="sm" onClick={addInterest}>+ Add Interest</Button>
          </div>
          {interests.map((interest, idx) => (
            <div key={idx} className="border rounded p-3 mb-4">
              <div className="mb-2 font-medium">Interest Item #{idx + 1}</div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Main Category *</label>
                <Select value={interest.mainCategory} onValueChange={val => {
                  setInterests(prev => {
                    const copy = [...prev];
                    copy[idx].mainCategory = val;
                    return copy;
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading categories..." : "Select Main Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : categories.length > 0 ? (
                      categories.map((category) => {
                        const categoryValue = category.id?.toString() || category.name || `category-${category.id}`;
                        const categoryName = category.name || `Category ${category.id}`;
                        return (
                          <SelectItem key={category.id} value={categoryValue}>
                            {categoryName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Only show product/revenue fields if mainCategory is selected */}
              {interest.mainCategory && (
                <>
                  {interest.products.map((prod, pidx) => (
                    <div key={pidx} className="border rounded p-2 mb-2 flex flex-col md:flex-row gap-2 items-center">
                      <div className="flex-1">
                        <label className="block text-xs font-medium mb-1">Product *</label>
                        <Select 
                          value={prod.product}
                          onValueChange={(value) => {
                            setInterests(prev => {
                              const copy = [...prev];
                              copy[idx].products[pidx].product = value;
                              return copy;
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loading ? "Loading products..." : "Select Product"} />
                          </SelectTrigger>
                          <SelectContent>
                            {loading ? (
                              <SelectItem value="loading-products" disabled>Loading products...</SelectItem>
                            ) : products.length > 0 ? (
                              products.map((product) => {
                                const productValue = product.id?.toString() || product.name || `product-${product.id}`;
                                const productName = product.name || `Product ${product.id}`;
                                return (
                                  <SelectItem key={product.id} value={productValue}>
                                    {productName}
                                  </SelectItem>
                                );
                              })
                            ) : (
                              <SelectItem value="no-products" disabled>No products available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium mb-1">Revenue Opportunity (₹) *</label>
                        <Input 
                          placeholder="e.g., 50000" 
                          value={prod.revenue}
                          onChange={(e) => {
                            setInterests(prev => {
                              const copy = [...prev];
                              copy[idx].products[pidx].revenue = e.target.value;
                              return copy;
                            });
                          }}
                        />
                        <div className="text-xs text-blue-600">Estimated revenue opportunity for this product</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="self-end text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeProductFromInterest(idx, pidx)}
                        type="button"
                      >
                        🗑️
                      </Button>
                    </div>
                  ))}
                  <Button variant="link" size="sm" className="text-orange-600" onClick={() => addProductToInterest(idx)}>
                    + Add Product to this Interest
                  </Button>
                </>
              )}
              {/* Customer Preference */}
              <div className="border rounded p-3 mt-3">
                <div className="font-semibold mb-2">Customer Preference</div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <Checkbox 
                      checked={interest.preferences.designSelected}
                      onCheckedChange={(checked) => {
                        setInterests(prev => {
                          const copy = [...prev];
                          copy[idx].preferences.designSelected = checked as boolean;
                          return copy;
                        });
                      }}
                    /> 
                    Design Selected?
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox 
                      checked={interest.preferences.wantsDiscount}
                      onCheckedChange={(checked) => {
                        setInterests(prev => {
                          const copy = [...prev];
                          copy[idx].preferences.wantsDiscount = checked as boolean;
                          return copy;
                        });
                      }}
                    /> 
                    Wants More Discount
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox 
                      checked={interest.preferences.checkingOthers}
                      onCheckedChange={(checked) => {
                        setInterests(prev => {
                          const copy = [...prev];
                          copy[idx].preferences.checkingOthers = checked as boolean;
                          return copy;
                        });
                      }}
                    /> 
                    Checking Other Jewellers
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox 
                      checked={interest.preferences.lessVariety}
                      onCheckedChange={(checked) => {
                        setInterests(prev => {
                          const copy = [...prev];
                          copy[idx].preferences.lessVariety = checked as boolean;
                          return copy;
                        });
                      }}
                    /> 
                    Felt Less Variety
                  </label>
                  <Input 
                    placeholder="Other Preferences (if any)" 
                    className="mt-2"
                    value={interest.preferences.other}
                    onChange={(e) => {
                      setInterests(prev => {
                        const copy = [...prev];
                        copy[idx].preferences.other = e.target.value;
                        return copy;
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Sales Pipeline Opportunities */}
        {interests.some(interest => interest.mainCategory && interest.products.some(p => p.product && p.revenue)) && (
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Sales Pipeline Opportunities</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generatePipelineOpportunities}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                🎯 Generate Opportunities
              </Button>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Create sales pipeline opportunities based on customer interests and revenue potential
            </div>
            
            {showPipelineSection && pipelineOpportunities.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-green-700 mb-2">
                  ✅ {pipelineOpportunities.length} opportunity(s) will be created in the sales pipeline
                </div>
                {pipelineOpportunities.map((opportunity, idx) => (
                  <div key={idx} className="border rounded p-3 bg-green-50">
                    <div className="font-medium text-green-800">{opportunity.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Expected Value:</span> ₹{opportunity.expected_value.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Probability:</span> {opportunity.probability}%
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Next Action:</span> {opportunity.next_action}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {opportunity.notes}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Follow-up & Summary */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="font-semibold mb-2">Follow-up & Summary</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Next Follow-up Date</label>
              <Input 
                type="date" 
                value={formData.nextFollowUpDate}
                onChange={(e) => handleInputChange('nextFollowUpDate', e.target.value)}
              />
              <div className="text-xs text-blue-600 mt-1">
                Setting a follow-up date will automatically create an appointment
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Follow-up Time</label>
              <Input 
                type="time" 
                value={formData.nextFollowUpTime}
                onChange={(e) => handleInputChange('nextFollowUpTime', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Summary Notes of Visit</label>
              <Textarea 
                placeholder="Key discussion points, items shown, next steps..." 
                rows={3}
                value={formData.summaryNotes}
                onChange={(e) => handleInputChange('summaryNotes', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button className="btn-primary" onClick={handleSubmit}>
              Add Customer & Visit Log
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}