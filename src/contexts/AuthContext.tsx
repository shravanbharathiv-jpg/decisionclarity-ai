import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasPaid: boolean;
  hasSubscription: boolean;
  subscriptionTier: 'free' | 'premium' | 'lifetime';
  isAdmin: boolean;
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
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium' | 'lifetime'>('free');
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!session) return;
    
    try {
      // Check one-time payment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('check-payment');
      if (!paymentError && paymentData?.hasPaid) {
        setHasPaid(true);
        setSubscriptionTier('lifetime');
      }

      // Check subscription
      const { data: subData, error: subError } = await supabase.functions.invoke('check-subscription');
      if (!subError) {
        setHasSubscription(subData?.subscribed || false);
        if (subData?.subscribed) {
          setSubscriptionTier('premium');
        }
        if (subData?.hasLifetimeAccess) {
          setHasPaid(true);
          setSubscriptionTier('lifetime');
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHasPaid(false);
    setHasSubscription(false);
    setSubscriptionTier('free');
    setIsAdmin(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          setTimeout(() => {
            checkPaymentStatus();
            checkAdminStatus(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          checkPaymentStatus();
          checkAdminStatus(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasAccess = hasPaid || hasSubscription || subscriptionTier !== 'free';

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      hasPaid: hasAccess, 
      hasSubscription,
      subscriptionTier,
      isAdmin,
      checkPaymentStatus,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
