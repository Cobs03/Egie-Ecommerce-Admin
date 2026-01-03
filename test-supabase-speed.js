// Test Supabase Connection Speed
// Run with: node test-supabase-speed.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mhhnfftaoihhltbknenq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oaG5mZnRhb2loaGx0YmtuZW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDk2MTUsImV4cCI6MjA3NDc4NTYxNX0.gxpt2FPigZXr4ASveppv7_6-OgHGTO2ey0LLiPXlPW4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection speed...\n');
  
  // Test 1: Simple query
  console.log('Test 1: Fetching profiles table...');
  const start1 = Date.now();
  const { data: profiles, error: error1 } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .limit(5);
  const time1 = Date.now() - start1;
  
  if (error1) {
    console.error('❌ Error:', error1.message);
  } else {
    console.log(`✅ Success! Fetched ${profiles.length} profiles in ${time1}ms`);
    if (time1 > 3000) {
      console.warn('⚠️ WARNING: Query took longer than 3 seconds!');
    }
  }
  
  // Test 2: Single profile query (simulating login)
  if (profiles && profiles.length > 0) {
    console.log('\nTest 2: Fetching single profile by ID...');
    const testUserId = profiles[0].id;
    const start2 = Date.now();
    const { data: profile, error: error2 } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    const time2 = Date.now() - start2;
    
    if (error2) {
      console.error('❌ Error:', error2.message);
    } else {
      console.log(`✅ Success! Fetched profile in ${time2}ms`);
      if (time2 > 3000) {
        console.warn('⚠️ WARNING: Query took longer than 3 seconds!');
      }
    }
  }
  
  // Test 3: Network latency
  console.log('\nTest 3: Checking network latency...');
  const start3 = Date.now();
  const { error: error3 } = await supabase.from('profiles').select('id').limit(1);
  const time3 = Date.now() - start3;
  
  if (error3) {
    console.error('❌ Error:', error3.message);
  } else {
    console.log(`✅ Network latency: ${time3}ms`);
    if (time3 > 1000) {
      console.warn('⚠️ WARNING: High network latency! Consider checking your internet connection.');
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`- If queries take > 3s: Your database/network is slow`);
  console.log(`- If queries take < 1s: Connection is good, issue is elsewhere`);
  console.log(`- Recommended: Keep timeout at 10s for reliable connections`);
}

testConnection().catch(console.error);
