import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasPaid: boolean;
  checkPaymentStatus: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);

  const checkPaymentStatus = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-payment');
      if (error) {
        console.error('Error checking payment status:', error);
        return;
      }
      setHasPaid(data?.hasPaid || false);
    } catch (error) {
      console.error('Error checking payment:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHasPaid(false);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check payment status when user logs in
        if (session?.user) {
          setTimeout(() => {
            checkPaymentStatus();
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          checkPaymentStatus();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      hasPaid, 
      checkPaymentStatus,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
