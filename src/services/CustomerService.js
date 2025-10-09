import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase.js'

export class CustomerService {
  // Get all customers
  static async getAllCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          orders (
            id,
            total_amount,
            status,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get customer by ID
  static async getCustomerById(id) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          orders (
            id,
            total_amount,
            status,
            created_at,
            order_items (
              quantity,
              price,
              products (
                name
              )
            )
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

  // Search customers
  static async searchCustomers(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)

      if (error) return handleSupabaseError(error)
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get customer statistics
  static async getCustomerStats() {
    try {
      const { data: totalCustomers, error: totalError } = await supabase
        .from('customers')
        .select('id', { count: 'exact' })

      const { data: newCustomers, error: newError } = await supabase
        .from('customers')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (totalError || newError) {
        return handleSupabaseError(totalError || newError)
      }

      return handleSupabaseSuccess({
        total: totalCustomers.length,
        newThisMonth: newCustomers.length
      })
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}