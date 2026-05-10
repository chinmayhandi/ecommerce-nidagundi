import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const withTimeout = (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
    ]);
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      console.log('checkUser started');
      try {
        const { data: { session }, error } = await withTimeout(supabase.auth.getSession(), 3000);
        console.log('getSession finished:', { session, error });
        
        if (session?.user) {
          console.log('User found, checking admin');
          setUser(session.user);
          await checkIfAdmin(session.user);
          console.log('Admin check finished');
        } else {
          console.log('No user session found');
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Auth session error:", err);
      } finally {
        console.log('checkUser finally - setting loading to false');
        setLoading(false);
      }
    };

    checkUser();

    // Listen for changes on auth state (log in, log out, etc)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user);
            await checkIfAdmin(session.user);
          } else {
            setUser(null);
            setIsAdmin(false);
          }
        } catch (err) {
          console.error("Auth state change error:", err);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkIfAdmin = async (currentUser) => {
    try {
      // Use the backend API to check profile, which bypasses frontend RLS issues
      const res = await withTimeout(api.get('/profile'), 5000);
        
      if (res.data && res.data.profile && res.data.profile.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Error checking admin status', err);
      setIsAdmin(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Logged in successfully!');
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) throw error;
      toast.success('Registration successful! Please check your email to verify.');
      
      // Attempt to create user profile via backend or directly
      // In a real app we might use a webhook or trigger in supabase for this
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to register');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to logout');
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
