import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import activityTracker from '../utils/activityTracker';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => {
    // Initialize from localStorage for instant load
    try {
      const cached = localStorage.getItem('admin_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('⚡ Loaded cached profile:', parsed.first_name, parsed.last_name);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading cached profile:', e);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => {
    // Initialize from cached profile
    try {
      const cached = localStorage.getItem('admin_profile');
      if (cached) {
        return JSON.parse(cached).is_admin === true;
      }
    } catch (e) {}
    return false;
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔄 Getting initial session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('✅ Session found for user:', session.user.id);
          setUser(session.user);
          
          // If we have cached profile for this user, skip DB load for speed
          if (profile?.id === session.user.id && profile?.first_name) {
            console.log('⚡ Using cached profile - skipping DB load for instant speed');
            activityTracker.startTracking(session.user.id);
            setLoading(false);
            return;
          }
          
          // Only load from DB if no valid cache
          console.log('🔄 Loading fresh profile from database...');
          await loadUserProfile(session.user.id);
          activityTracker.startTracking(session.user.id);
        } else {
          console.log('ℹ️ No active session found');
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
      } finally {
        // ALWAYS clear loading state, even if something fails
        console.log('✅ Initial session check complete - clearing loading state');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event);
        
        // Ignore INITIAL_SESSION event if we already have a profile
        if (event === 'INITIAL_SESSION' && profile?.id === session?.user?.id && profile?.first_name) {
          console.log('⏭️ Skipping INITIAL_SESSION - profile already loaded for:', profile.first_name, profile.last_name);
          setLoading(false);
          return;
        }
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only reload profile if it's a different user or we don't have one yet
          if (!profile || profile.id !== session.user.id || !profile.first_name) {
            console.log('🔄 Loading profile for new/missing user');
            await loadUserProfile(session.user.id);
          } else {
            console.log('✅ Using existing profile - no reload needed');
          }
          // Start activity tracking when user logs in
          activityTracker.startTracking(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          // Stop activity tracking when user logs out
          activityTracker.stopTracking();
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
      // Clean up activity tracking on unmount
      activityTracker.stopTracking();
    };
  }, []);

  const loadUserProfile = async (userId, forceReload = false) => {
    try {
      // Skip if we already have a valid profile for this user (unless forced)
      if (!forceReload && profile?.id === userId && profile?.first_name) {
        console.log('✅ Profile already loaded, skipping reload');
        return;
      }

      console.log('Loading profile for user:', userId);
      
      // Store current profile as backup before attempting to reload
      const backupProfile = profile?.id === userId ? profile : null;
      if (backupProfile) {
        console.log('📦 Backup profile stored:', backupProfile.first_name, backupProfile.last_name);
      }
      
      // Shorter timeout for faster response
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile load timeout')), 5000)
      );

      let data, error;
      try {
        const result = await Promise.race([profilePromise, timeoutPromise]);
        data = result.data;
        error = result.error;
      } catch (timeoutError) {
        console.error('⏱️ Profile load timeout after 5 seconds');
        // If we have a backup profile, keep using it - DO NOT create fallback
        if (backupProfile) {
          console.log('✅ Keeping existing profile:', backupProfile.first_name, backupProfile.last_name, '(is_admin:', backupProfile.is_admin + ')');
          setLoading(false); // Clear loading state
          return;
        }
        // Try one more time without timeout (but with shorter direct timeout)
        console.log('🔄 Retrying profile load without timeout...');
        try {
          const retry = await Promise.race([
            profilePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Retry timeout')), 3000))
          ]);
          data = retry.data;
          error = retry.error;
        } catch (retryError) {
          console.error('❌ Retry also failed:', retryError.message);
          // If retry fails and we have backup, use it
          if (backupProfile) {
            console.log('✅ Using backup after retry failure');
            setLoading(false);
            return;
          }
          // No backup, set loading to false anyway to unblock UI
          console.error('⚠️ No profile available, clearing loading state');
          setLoading(false);
          return;
        }
      }

      console.log('Profile query result:', { data, error });

      if (error) {
        console.error('Profile query error:', error);
        
        if (error.code === 'PGRST116') {
          console.log('No profile found, creating one...');
          // ONLY create profile if NO backup exists
          if (backupProfile) {
            console.log('✅ Using backup profile instead of creating new one');
            return;
          }
          
          // Try to create a profile for this user
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            const fullName = userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'Admin User';
            const [firstName, ...lastNameParts] = fullName.split(' ');
            const lastName = lastNameParts.join(' ') || '';
            
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userData.user.email,
                first_name: firstName,
                last_name: lastName,
                is_admin: false // Will be set to true manually for admin users
              })
              .select()
              .single();

            console.log('Profile creation result:', { newProfile, createError });
            
            if (newProfile) {
              setProfile(newProfile);
              setIsAdmin(newProfile.is_admin === true);
              console.log('New profile created:', newProfile);
            }
          }
        } else {
          console.error('Error loading profile:', error);
          // ALWAYS keep backup profile if it exists
          if (backupProfile) {
            console.log('✅ Keeping backup profile after error:', backupProfile.first_name, backupProfile.last_name);
            return;
          }
        }
        return;
      }

      if (data) {
        console.log('✅ Profile loaded successfully:', data.first_name, data.last_name, '(is_admin:', data.is_admin + ')');
        // Cache profile in localStorage for instant future loads
        try {
          localStorage.setItem('admin_profile', JSON.stringify(data));
          console.log('💾 Profile cached to localStorage');
        } catch (e) {
          console.error('Failed to cache profile:', e);
        }
        setProfile(data);
        setIsAdmin(data.is_admin === true);
        console.log('Is admin:', data.is_admin);
        
        // Update last_login timestamp (non-blocking)
        updateLastLogin(userId).catch(err => {
          console.error('Failed to update last login:', err);
        });
      } else {
        console.log('No profile data returned');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't set fallback profile - let it retry naturally
    }
  };

  const updateLastLogin = async (userId) => {
    try {
      // Update last_login timestamp using RPC function
      const { error } = await supabase.rpc('update_user_last_login', { 
        user_id: userId 
      });

      if (error) {
        console.error('Error updating last login:', error);
        // Fallback: try direct update
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Failed to update last login:', error);
      // Non-critical error, don't block user
    }
  };

  const signOut = async () => {
    // Stop activity tracking before signing out
    activityTracker.stopTracking();
    
    // Clear cached profile
    try {
      localStorage.removeItem('admin_profile');
      console.log('🗑️ Cleared cached profile');
    } catch (e) {}
    
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    }
    return { error };
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signOut,
    loadUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;