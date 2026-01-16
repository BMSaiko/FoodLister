'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getClient } from '@/libs/supabase/client';
import { toast } from 'react-toastify';

const FiltersContext = createContext();

export function FiltersProvider({ children }) {
  const [clearTrigger, setClearTrigger] = useState(0);

  const clearFilters = () => {
    setClearTrigger(prev => prev + 1);
  };

  return (
    <FiltersContext.Provider value={{ clearTrigger, clearFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = getClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast.success('Login realizado com sucesso!');
        } else if (event === 'SIGNED_OUT') {
          toast.info('Você foi desconectado');
        } else if (event === 'PASSWORD_RECOVERY') {
          toast.info('Verifique seu email para redefinir a senha');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast.success('Verifique seu email para confirmar a conta!');
      }

      return { data, error: null };
    } catch (error) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      toast.error(error.message);
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success('Email de redefinição enviado!');
      return { error: null };
    } catch (error) {
      toast.error(error.message);
      return { error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Senha atualizada com sucesso!');
      return { error: null };
    } catch (error) {
      toast.error(error.message);
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, FiltersProvider, useAuth, useFilters };
