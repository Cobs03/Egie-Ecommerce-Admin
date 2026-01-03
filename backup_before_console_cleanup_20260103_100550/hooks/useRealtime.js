import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useRealtimeProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) {
        setProducts(data || [])
      }
      setLoading(false)
    }

    fetchProducts()

    // Set up real-time subscription
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Product change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            setProducts(current => [payload.new, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setProducts(current =>
              current.map(item =>
                item.id === payload.new.id ? payload.new : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setProducts(current =>
              current.filter(item => item.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { products, loading, setProducts }
}

export const useRealtimeOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              name,
              images
            )
          ),
          customers (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (!error) {
        setOrders(data || [])
      }
      setLoading(false)
    }

    fetchOrders()

    // Set up real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            setOrders(current => [payload.new, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setOrders(current =>
              current.map(item =>
                item.id === payload.new.id ? payload.new : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setOrders(current =>
              current.filter(item => item.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { orders, loading, setOrders }
}

export const useRealtimeBundles = () => {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    const fetchBundles = async () => {
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) {
        setBundles(data || [])
      }
      setLoading(false)
    }

    fetchBundles()

    // Set up real-time subscription
    const channel = supabase
      .channel('bundles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bundles',
        },
        (payload) => {
          console.log('Bundle change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            setBundles(current => [payload.new, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setBundles(current =>
              current.map(item =>
                item.id === payload.new.id ? payload.new : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setBundles(current =>
              current.filter(item => item.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { bundles, loading, setBundles }
}