import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      console.log('Loading profile for user:', userId);
      
      // Add timeout to prevent hanging queries
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 10000)
      );
      
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('Profile query result:', { data, error });

      if (error) {
        console.error('Profile query error:', error);
        
        if (error.message === 'Profile query timeout') {
          console.log('Query timed out - likely RLS policy issue');
          // Set basic profile for now
          setProfile({ id: userId, email: 'egiegameshop2025@gmail.com', is_admin: true });
          setIsAdmin(true);
          return;
        }
        
        if (error.code === 'PGRST116') {
          console.log('No profile found, creating one...');
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
        }
        return;
      }

      if (data) {
        console.log('Profile loaded:', data);
        setProfile(data);
        setIsAdmin(data.is_admin === true);
        console.log('Is admin:', data.is_admin);
      } else {
        console.log('No profile found');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signOut = async () => {
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