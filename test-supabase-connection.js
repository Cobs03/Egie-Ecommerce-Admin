import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mhhnfftaoihhltbknenq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oaG5mZnRhb2loaGx0YmtuZW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDk2MTUsImV4cCI6MjA3NDc4NTYxNX0.gxpt2FPigZXr4ASveppv7_6-OgHGTO2ey0LLiPXlPW4'

console.log('🔍 Testing Supabase Connection...\n')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n⏱️ Testing profile query speed...')
    const startTime = Date.now()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (error) {
      console.error('❌ Query failed:', error)
      return
    }
    
    console.log(`✅ Query completed in ${duration}ms`)
    console.log('📊 Result:', data)
    
    if (duration > 5000) {
      console.warn('⚠️ WARNING: Query took longer than 5 seconds!')
      console.warn('This suggests RLS policies or network issues')
    } else if (duration > 1000) {
      console.warn('⚠️ Query is slower than expected (>1s)')
    } else {
      console.log('✅ Query speed is good!')
    }
    
  } catch (err) {
    console.error('❌ Connection test failed:', err)
  }
}

testConnection()
