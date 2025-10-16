import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js'

export class BundleService {
  // Create a new bundle with products
  static async createBundle(bundleData) {
    try {
      // Check user role - managers and admins can create bundles
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

      // Allow admin and manager roles to create bundles
      if (profile.role !== 'admin' && profile.role !== 'manager') {
        return handleSupabaseError(new Error('Only admins and managers can create bundles'))
      }

      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .insert([{
          bundle_name: bundleData.name,
          description: bundleData.description,
          initial_price: bundleData.originalPrice,
          official_price: bundleData.bundlePrice,
          discount: bundleData.discountPercentage,
          warranty: bundleData.warranty,
          images: bundleData.images || [],
          status: bundleData.isActive ? 'active' : 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (bundleError) {
        // Provide more specific error message for RLS issues
        if (bundleError.message.includes('row-level security') || bundleError.message.includes('RLS')) {
          return handleSupabaseError(new Error(
            'Permission denied: Only admins and managers can create bundles. ' +
            'RLS Error: ' + bundleError.message
          ))
        }
        return handleSupabaseError(bundleError)
      }

      // Then, create bundle_products entries
      if (bundleData.products && bundleData.products.length > 0) {
        const bundleProducts = bundleData.products.map((product, index) => ({
          bundle_id: bundle.id,
          product_name: product.name,
          product_code: product.code,
          product_price: product.price,
          product_image: product.image,
          sort_order: index
        }))

        const { error: productsError } = await supabase
          .from('bundle_products')
          .insert(bundleProducts)

        if (productsError) {
          // Rollback: delete the bundle if products insertion fails
          await supabase.from('bundles').delete().eq('id', bundle.id)
          return handleSupabaseError(productsError)
        }
      }

      return handleSupabaseSuccess(bundle)
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
          bundle_products (
            id,
            product_name,
            product_code,
            product_price,
            product_image,
            sort_order
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
          bundle_products (
            id,
            product_name,
            product_code,
            product_price,
            product_image,
            sort_order
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
      // Check user role - managers and admins can update bundles
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

      // Allow admin and manager roles to update bundles
      if (profile.role !== 'admin' && profile.role !== 'manager') {
        return handleSupabaseError(new Error('Only admins and managers can update bundles'))
      }

      // Update the bundle
      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .update({
          bundle_name: bundleData.name,
          description: bundleData.description,
          initial_price: bundleData.originalPrice,
          official_price: bundleData.bundlePrice,
          discount: bundleData.discountPercentage,
          warranty: bundleData.warranty,
          images: bundleData.images || [],
          status: bundleData.isActive ? 'active' : 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (bundleError) {
        // Provide more specific error message for RLS issues
        if (bundleError.message.includes('row-level security') || bundleError.message.includes('RLS')) {
          return handleSupabaseError(new Error(
            'Permission denied: Only admins and managers can update bundles. ' +
            'RLS Error: ' + bundleError.message
          ))
        }
        return handleSupabaseError(bundleError)
      }

      // Delete existing bundle_products
      await supabase
        .from('bundle_products')
        .delete()
        .eq('bundle_id', id)

      // Insert new bundle_products
      if (bundleData.products && bundleData.products.length > 0) {
        const bundleProducts = bundleData.products.map((product, index) => ({
          bundle_id: id,
          product_name: product.name,
          product_code: product.code,
          product_price: product.price,
          product_image: product.image,
          sort_order: index
        }))

        const { error: productsError } = await supabase
          .from('bundle_products')
          .insert(bundleProducts)

        if (productsError) return handleSupabaseError(productsError)
      }

      return handleSupabaseSuccess(bundle)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Delete bundle
  static async deleteBundle(id) {
    try {
      // Delete bundle_products first (foreign key constraint)
      await supabase
        .from('bundle_products')
        .delete()
        .eq('bundle_id', id)

      // Then delete the bundle
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