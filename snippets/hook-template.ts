// ============================================
// Data Fetching Hook Template
// ============================================
// hooks/data/use[Resource].ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/libs/supabase/client';

interface [Resource] {
  id: string;
  name: string;
  created_at: string;
}

interface Use[Resource]Options {
  limit?: number;
  orderBy?: string;
  ascending?: boolean;
}

export function use[Resource]s(options: Use[Resource]Options = {}) {
  const { limit = 20, orderBy = 'created_at', ascending = false } = options;
  const [data, setData] = useState<[Resource][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch[Resource]s = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('[resource]')
        .select('*')
        .order(orderBy, { ascending })
        .limit(limit);

      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [limit, orderBy, ascending]);

  useEffect(() => {
    fetch[Resource]s();
  }, [fetch[Resource]s]);

  return { data, loading, error, refetch: fetch[Resource]s };
}

// ============================================
// Auth Hook Template
// ============================================
// hooks/auth/useAuth.ts
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/libs/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================
// Form Hook Template
// ============================================
// hooks/forms/use[Form]Form.ts
'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface [Form]FormData {
  name: string;
  description?: string;
}

interface Use[Form]FormOptions {
  onSuccess?: () => void;
  initialData?: Partial<[Form]FormData>;
}

export function use[Form]Form(options: Use[Form]FormOptions = {}) {
  const { onSuccess, initialData } = options;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<[Form]FormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  const onSubmit = async (data: [Form]FormData) => {
    try {
      setIsSubmitting(true);
      // Submit logic
      toast.success('[Form] created successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create [Form]');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, onSubmit, isSubmitting };
}