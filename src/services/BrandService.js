import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js'

export class BrandService {
  // Get all brands
  static async getAllBrands() {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Create a new brand
  static async createBrand(brandData) {
    try {
      // Check user role - managers and admins can create brands
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return handleSupabaseError(new Error('No authenticated user'))
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return handleSupabaseError(new Error(`Failed to check user role: ${profileError.message}`))
      }

      // Allow admin and manager roles to create brands
      if (profile.role !== 'admin' && profile.role !== 'manager') {
        return handleSupabaseError(new Error('Only admins and managers can create brands'))
      }

      // Generate slug from name
      const slug = brandData.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      const { data, error } = await supabase
        .from('brands')
        .insert([{
          name: brandData.name.trim(),
          slug: slug,
          description: brandData.description?.trim() || null,
          logo_url: brandData.logo_url || null,
          website_url: brandData.website_url || null,
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        if (error.message.includes('row-level security') || error.message.includes('RLS')) {
          return handleSupabaseError(new Error(
            'Permission denied: Only admins and managers can create brands. ' +
            'RLS Error: ' + error.message
          ))
        }
        return handleSupabaseError(error)
      }
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Update brand
  static async updateBrand(id, brandData) {
    try {
      // Generate slug from name if name is being updated
      const updateData = { ...brandData }
      if (brandData.name) {
        updateData.slug = brandData.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
      }

      const { data, error } = await supabase
        .from('brands')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Delete brand (soft delete - set is_active to false)
  static async deleteBrand(id) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get brand by ID
  static async getBrandById(id) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}