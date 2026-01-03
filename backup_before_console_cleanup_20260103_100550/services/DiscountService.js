import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js';

export class DiscountService {
  // ==========================================
  // PRODUCT QUERY METHODS
  // ==========================================

  // Search products for discount selection
  static async searchProducts(searchTerm = '', limit = 50) {
    try {
      let query = supabase
        .from('products')
        .select('id, name, price, images, stock_quantity, selected_components, status')
        .eq('status', 'active')
        .order('name', { ascending: true })
        .limit(limit);

      // Add search filter if provided
      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get product by ID
  static async getProductById(productId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images, stock_quantity, selected_components')
        .eq('id', productId)
        .single();

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get products by IDs (for loading selected products)
  static async getProductsByIds(productIds) {
    try {
      if (!productIds || productIds.length === 0) {
        return handleSupabaseSuccess([]);
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images, stock_quantity, selected_components')
        .in('id', productIds);

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get all unique categories from products (selected_components)
  static async getProductCategories() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('selected_components')
        .eq('status', 'active');

      if (error) return handleSupabaseError(error);

      // Extract unique categories from all products
      const categoriesSet = new Set();
      data.forEach(product => {
        if (product.selected_components && Array.isArray(product.selected_components)) {
          product.selected_components.forEach(comp => {
            // Handle both object {id, name} and string formats
            const categoryName = typeof comp === 'object' && comp !== null ? comp.name : comp;
            if (categoryName) {
              categoriesSet.add(categoryName);
            }
          });
        }
      });

      const categories = Array.from(categoriesSet).sort();
      return handleSupabaseSuccess(categories);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // ==========================================
  // DISCOUNT CRUD METHODS
  // ==========================================

  // Get all discounts
  static async getAllDiscounts() {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get active discounts only
  static async getActiveDiscounts() {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
        .order('created_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get applicable discounts for a product/category
  static async getApplicableDiscounts(productCategory = null, userType = 'All Users', purchaseAmount = 0) {
    try {
      let query = supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`);

      // Filter by minimum spend
      if (purchaseAmount > 0) {
        query = query.or(`min_spend.is.null,min_spend.lte.${purchaseAmount}`);
      }

      const { data, error } = await query.order('discount_value', { ascending: false });

      if (error) return handleSupabaseError(error);

      // Further filter by category and user eligibility
      const filteredDiscounts = data.filter(discount => {
        // Check user eligibility
        if (discount.user_eligibility !== 'All Users' && discount.user_eligibility !== userType) {
          return false;
        }

        // Check if applies to product category
        if (productCategory && discount.applies_to !== 'All Products') {
          if (discount.applies_to !== productCategory) {
            return false;
          }
        }

        return true;
      });

      return handleSupabaseSuccess(filteredDiscounts);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Calculate discount amount
  static calculateDiscountAmount(discount, originalAmount) {
    let discountAmount = 0;

    if (discount.discount_type === 'percent') {
      discountAmount = (originalAmount * discount.discount_value) / 100;
      
      // Apply max discount cap if set
      if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
        discountAmount = discount.max_discount_amount;
      }
    } else if (discount.discount_type === 'fixed') {
      discountAmount = Math.min(discount.discount_value, originalAmount);
    }

    return {
      discount_amount: discountAmount,
      final_amount: Math.max(0, originalAmount - discountAmount)
    };
  }

  // Create new discount
  static async createDiscount(discountData) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return handleSupabaseError(new Error('No authenticated user'));
      }

      const { data, error } = await supabase
        .from('discounts')
        .insert([{
          name: discountData.name,
          discount_type: discountData.discountType,
          discount_value: discountData.discountValue,
          valid_from: discountData.validFrom,
          valid_until: discountData.validUntil,
          applies_to: discountData.appliesTo || 'All Products',
          apply_to_type: discountData.applyToType || 'all', // NEW: all, specific_products, specific_categories
          min_spend: discountData.minSpend || null,
          user_eligibility: discountData.userEligibility || 'All Users',
          description: discountData.description || null,
          is_active: discountData.isActive !== false,
          max_discount_amount: discountData.maxDiscountAmount || null,
          applicable_products: discountData.applicableProducts || [],
          applicable_categories: discountData.applicableCategories || [],
          created_by: user.id
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Update discount
  static async updateDiscount(id, discountData) {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .update({
          name: discountData.name,
          discount_type: discountData.discountType,
          discount_value: discountData.discountValue,
          valid_from: discountData.validFrom,
          valid_until: discountData.validUntil,
          applies_to: discountData.appliesTo || 'All Products',
          apply_to_type: discountData.applyToType || 'all', // NEW: all, specific_products, specific_categories
          min_spend: discountData.minSpend || null,
          user_eligibility: discountData.userEligibility || 'All Users',
          description: discountData.description || null,
          is_active: discountData.isActive,
          max_discount_amount: discountData.maxDiscountAmount || null,
          applicable_products: discountData.applicableProducts || [],
          applicable_categories: discountData.applicableCategories || []
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Delete discount
  static async deleteDiscount(id) {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id);

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Toggle discount active status
  static async toggleDiscountStatus(id, isActive) {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Record discount usage
  static async recordDiscountUsage(discountId, customerId, orderId, originalAmount) {
    try {
      // Get discount
      const { data: discount, error: discountError } = await supabase
        .from('discounts')
        .select('*')
        .eq('id', discountId)
        .single();

      if (discountError) return handleSupabaseError(discountError);

      // Calculate discount
      const { discount_amount, final_amount } = this.calculateDiscountAmount(discount, originalAmount);

      // Insert usage record
      const { data, error } = await supabase
        .from('discount_usage')
        .insert([{
          discount_id: discountId,
          customer_id: customerId,
          order_id: orderId,
          discount_amount: discount_amount,
          original_amount: originalAmount,
          final_amount: final_amount
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);

      // Usage count is automatically incremented by trigger
      return handleSupabaseSuccess({
        usage: data,
        discount_amount: discount_amount,
        final_amount: final_amount
      });
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get discount usage history
  static async getDiscountUsageHistory(discountId) {
    try {
      const { data, error } = await supabase
        .from('discount_usage')
        .select(`
          *,
          customer:customer_id (
            id,
            full_name,
            email
          )
        `)
        .eq('discount_id', discountId)
        .order('used_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get customer discount usage
  static async getCustomerDiscountUsage(customerId) {
    try {
      const { data, error } = await supabase
        .from('discount_usage')
        .select(`
          *,
          discount:discount_id (
            id,
            name,
            discount_type,
            discount_value
          )
        `)
        .eq('customer_id', customerId)
        .order('used_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
}
