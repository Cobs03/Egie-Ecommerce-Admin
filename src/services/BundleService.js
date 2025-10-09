import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js'

export class BundleService {
  // Create a new bundle
  static async createBundle(bundleData) {
    try {
      const { data, error } = await supabase
        .from('bundles')
        .insert([{
          name: bundleData.name,
          description: bundleData.description,
          original_price: bundleData.originalPrice,
          bundle_price: bundleData.bundlePrice,
          discount_percentage: bundleData.discountPercentage,
          product_ids: bundleData.productIds,
          images: bundleData.images || [],
          is_active: bundleData.isActive || true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data[0])
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get all bundles with product details
  static async getAllBundles() {
    try {
      const { data, error } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_products:product_ids (
            id,
            name,
            price,
            images
          )
        `)
        .order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get bundle by ID
  static async getBundleById(id) {
    try {
      const { data, error } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_products:product_ids (
            id,
            name,
            price,
            images,
            stock_quantity
          )
        `)
        .eq('id', id)
        .single()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Update bundle
  static async updateBundle(id, bundleData) {
    try {
      const { data, error } = await supabase
        .from('bundles')
        .update({
          ...bundleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data[0])
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Delete bundle
  static async deleteBundle(id) {
    try {
      const { data, error } = await supabase
        .from('bundles')
        .delete()
        .eq('id', id)

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}