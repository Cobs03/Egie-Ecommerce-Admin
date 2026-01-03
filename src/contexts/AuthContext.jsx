import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
        return parsed;
      }
    } catch (e) {
      console.error('Error loading cached profile:', e);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const isLoadingProfileRef = useRef(false); // Use ref instead of state for immediate reads
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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          
          // Check if cached profile matches current user
          const cachedProfile = (() => {
            try {
              const cached = localStorage.getItem('admin_profile');
              return cached ? JSON.parse(cached) : null;
            } catch (e) {
              return null;
            }
          })();
          
          // If cached profile is for DIFFERENT user, clear it immediately
          if (cachedProfile && cachedProfile.id !== session.user.id) {
            localStorage.removeItem('admin_profile');
            setProfile(null);
            setIsAdmin(false);
          }
          
          // Always load fresh profile from DB on page load/refresh
          await loadUserProfile(session.user.id, true);
          activityTracker.startTracking(session.user.id);
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
      } finally {
        // ALWAYS clear loading state, even if something fails
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth event:', event, 'User:', session?.user?.id);
        
        // Ignore INITIAL_SESSION event - handled by getInitialSession above
        if (event === 'INITIAL_SESSION') {
          console.log('⏭️ Ignoring INITIAL_SESSION - already handled');
          return;
        }
        
        // For TOKEN_REFRESHED and other session updates, DON'T reload profile
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          console.log('✅ Token refreshed, keeping current profile');
          return;
        }
        
        // Prevent duplicate SIGNED_IN events if profile is already loading
        if (event === 'SIGNED_IN' && isLoadingProfileRef.current) {
          console.log('⏭️ Profile already loading, ignoring duplicate SIGNED_IN event');
          return;
        }
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // On SIGNED_IN, check if we already have the correct profile cached
          if (event === 'SIGNED_IN') {
            const cachedProfile = (() => {
              try {
                const cached = localStorage.getItem('admin_profile');
                return cached ? JSON.parse(cached) : null;
              } catch (e) {
                return null;
              }
            })();
            
            // If cache is valid for THIS user, use it
            if (cachedProfile && cachedProfile.id === session.user.id && cachedProfile.first_name) {
              console.log('✅ SIGNED_IN: Using valid cached profile');
              setProfile(cachedProfile);
              setIsAdmin(cachedProfile.is_admin === true);
              setLoading(false);
            } else {
              console.log('🔑 SIGNED_IN event - loading fresh profile');
              await loadUserProfile(session.user.id, true);
            }
          }
          // If switching users (different user ID), clear cache and reload
          else if (profile && profile.id !== session.user.id) {
            console.log('👤 User switch detected - clearing cache');
            localStorage.removeItem('admin_profile');
            setProfile(null);
            setIsAdmin(false);
            await loadUserProfile(session.user.id, true);
          }
          // Only reload profile if we don't have one yet
          else if (!profile || !profile.first_name) {
            console.log('📝 No profile loaded - loading now');
            await loadUserProfile(session.user.id, false); // Don't force, use cache if available
          } else {
            console.log('✅ Profile already loaded, skipping reload');
          }
          // Start activity tracking when user logs in
          activityTracker.startTracking(session.user.id);
        } else {
          // Clear everything on sign out
          console.log('🚪 SIGNED_OUT event - clearing all data');
          localStorage.removeItem('admin_profile');
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
    // Prevent duplicate loads using ref (immediate check)
    if (isLoadingProfileRef.current && !forceReload) {
      console.log('⏭️ Profile already loading, skipping duplicate request');
      return;
    }

    try {
      isLoadingProfileRef.current = true;

      // Skip if we already have a valid profile for this user (unless forced)
      if (!forceReload && profile?.id === userId && profile?.first_name) {
        console.log('✅ Profile already loaded for this user');
        isLoadingProfileRef.current = false;
        return;
      }

      // Check localStorage cache first
      const cachedProfile = (() => {
        try {
          const cached = localStorage.getItem('admin_profile');
          if (cached) {
            const parsed = JSON.parse(cached);
            // Only use cache if it's for the SAME user
            if (parsed.id === userId) {
              return parsed;
            }
          }
        } catch (e) {}
        return null;
      })();

      // If we have valid cache and not forcing reload, use it immediately
      if (!forceReload && cachedProfile && cachedProfile.first_name) {
        console.log('✅ Using cached profile');
        setProfile(cachedProfile);
        setIsAdmin(cachedProfile.is_admin === true);
        setLoading(false);
        isLoadingProfileRef.current = false;
        return;
      }
      
      // Load from database with timeout to prevent infinite hang
      console.log('📥 Loading profile from database...');
      
      // Create a promise that rejects after 10 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 10000)
      );
      
      // Race between the query and the timeout
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      let data, error;
      try {
        const result = await Promise.race([queryPromise, timeoutPromise]);
        data = result.data;
        error = result.error;
      } catch (timeoutError) {
        console.error('❌ Query timeout - using cached profile or fallback');
        // Use cached profile if available
        if (cachedProfile) {
          console.log('⚠️ Using cached profile due to timeout');
          setProfile(cachedProfile);
          setIsAdmin(cachedProfile.is_admin === true);
        } else {
          console.error('❌ No cached profile available');
          setProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
        isLoadingProfileRef.current = false;
        return;
      }

      if (error) {
        console.error('❌ Error loading profile:', error);
        
        if (error.code === 'PGRST116') {
          console.error('No profile found in database for user:', userId);
          // Clear any stale cache
          localStorage.removeItem('admin_profile');
          setProfile(null);
          setIsAdmin(false);
        } else {
          // On other errors, use cached profile if available
          if (cachedProfile) {
            console.log('⚠️ Using cached profile due to error');
            setProfile(cachedProfile);
            setIsAdmin(cachedProfile.is_admin === true);
          }
        }
        setLoading(false);
        isLoadingProfileRef.current = false;
        return;
      }

      if (data) {
        console.log('✅ Profile loaded successfully:', data.first_name, data.last_name);
        // Cache profile in localStorage for instant future loads
        try {
          localStorage.setItem('admin_profile', JSON.stringify(data));
        } catch (e) {
          console.error('Failed to cache profile:', e);
        }
        setProfile(data);
        setIsAdmin(data.is_admin === true);
        setLoading(false);
        isLoadingProfileRef.current = false;
        // Update last_login timestamp (non-blocking, no await)
        updateLastLogin(userId).catch(() => {});
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
      isLoadingProfileRef.current = false;
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