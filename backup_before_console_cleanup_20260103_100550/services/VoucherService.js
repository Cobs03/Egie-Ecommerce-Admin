import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js';

export class VoucherService {
  // Get all vouchers
  static async getAllVouchers() {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get active vouchers only
  static async getActiveVouchers() {
    try {
      const { data, error } = await supabase
        .from('vouchers')
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

  // Get voucher by code (for customer checkout)
  static async getVoucherByCode(code) {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Validate voucher (check if it can be used)
  static async validateVoucher(code, customerId = null, purchaseAmount = 0) {
    try {
      // Get voucher by code
      const voucherResult = await this.getVoucherByCode(code);
      if (!voucherResult.success) {
        return { success: false, error: 'Invalid voucher code' };
      }

      const voucher = voucherResult.data;

      // Check if active
      if (!voucher.is_active) {
        return { success: false, error: 'This voucher is no longer active' };
      }

      // Check date validity
      const now = new Date();
      const validFrom = new Date(voucher.valid_from);
      const validUntil = voucher.valid_until ? new Date(voucher.valid_until) : null;

      if (now < validFrom) {
        return { success: false, error: 'This voucher is not yet valid' };
      }

      if (validUntil && now > validUntil) {
        return { success: false, error: 'This voucher has expired' };
      }

      // Check usage limit
      if (voucher.usage_count >= voucher.usage_limit) {
        return { success: false, error: 'This voucher has reached its usage limit' };
      }

      // Check minimum purchase amount
      if (purchaseAmount < voucher.min_purchase_amount) {
        return { 
          success: false, 
          error: `Minimum purchase of ₱${voucher.min_purchase_amount} required` 
        };
      }

      // Check per-customer limit (if customerId provided)
      if (customerId && voucher.per_customer_limit) {
        const { data: usageData, error: usageError } = await supabase
          .from('voucher_usage')
          .select('id')
          .eq('voucher_id', voucher.id)
          .eq('customer_id', customerId);

        if (usageError) return handleSupabaseError(usageError);

        if (usageData.length >= voucher.per_customer_limit) {
          return { 
            success: false, 
            error: 'You have already used this voucher the maximum number of times' 
          };
        }
      }

      // All validations passed
      return { 
        success: true, 
        data: voucher,
        message: 'Voucher is valid'
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Create new voucher
  static async createVoucher(voucherData) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return handleSupabaseError(new Error('No authenticated user'));
      }

      const { data, error } = await supabase
        .from('vouchers')
        .insert([{
          name: voucherData.name,
          code: voucherData.code.toUpperCase(),
          discount_type: voucherData.discountType || 'fixed', // Add discount type
          price: voucherData.price,
          valid_from: voucherData.validFrom,
          valid_until: voucherData.validUntil,
          usage_limit: voucherData.usageLimit,
          description: voucherData.description || null,
          is_active: voucherData.isActive !== false,
          per_customer_limit: voucherData.perCustomerLimit || 1,
          min_purchase_amount: voucherData.minPurchaseAmount || 0,
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

  // Update voucher
  static async updateVoucher(id, voucherData) {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .update({
          name: voucherData.name,
          code: voucherData.code.toUpperCase(),
          discount_type: voucherData.discountType || 'fixed', // Add discount type
          price: voucherData.price,
          valid_from: voucherData.validFrom,
          valid_until: voucherData.validUntil,
          usage_limit: voucherData.usageLimit,
          description: voucherData.description || null,
          is_active: voucherData.isActive,
          per_customer_limit: voucherData.perCustomerLimit || 1,
          min_purchase_amount: voucherData.minPurchaseAmount || 0
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

  // Delete voucher
  static async deleteVoucher(id) {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', id);

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Toggle voucher active status
  static async toggleVoucherStatus(id, isActive) {
    try {
      const { data, error } = await supabase
        .from('vouchers')
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

  // Record voucher usage
  static async recordVoucherUsage(voucherCode, customerId, orderId, originalAmount) {
    try {
      // Get voucher
      const voucherResult = await this.getVoucherByCode(voucherCode);
      if (!voucherResult.success) {
        return voucherResult;
      }

      const voucher = voucherResult.data;
      const discountAmount = voucher.price;
      const finalAmount = Math.max(0, originalAmount - discountAmount);

      // Insert usage record
      const { data, error } = await supabase
        .from('voucher_usage')
        .insert([{
          voucher_id: voucher.id,
          customer_id: customerId,
          order_id: orderId,
          discount_amount: discountAmount,
          original_amount: originalAmount,
          final_amount: finalAmount
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);

      // Usage count is automatically incremented by trigger
      return handleSupabaseSuccess({
        usage: data,
        discount_amount: discountAmount,
        final_amount: finalAmount
      });
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get voucher usage history
  static async getVoucherUsageHistory(voucherId) {
    try {
      const { data, error } = await supabase
        .from('voucher_usage')
        .select(`
          *,
          customer:customer_id (
            id,
            full_name,
            email
          )
        `)
        .eq('voucher_id', voucherId)
        .order('used_at', { ascending: false });

      if (error) return handleSupabaseError(error);
      return handleSupabaseSuccess(data);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get customer voucher usage
  static async getCustomerVoucherUsage(customerId) {
    try {
      const { data, error } = await supabase
        .from('voucher_usage')
        .select(`
          *,
          voucher:voucher_id (
            id,
            name,
            code,
            price
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
