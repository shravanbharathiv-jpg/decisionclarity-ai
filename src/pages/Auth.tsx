import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      // Check if this is a new user who hasn't completed onboarding
      const hasCompletedOnboarding = localStorage.getItem('onboarding-completed');
      if (!hasCompletedOnboarding) {
        // Check if the user just signed up (account created very recently)
        const createdAt = user.created_at ? new Date(user.created_at) : null;
        const now = new Date();
        const isNewUser = createdAt && (now.getTime() - createdAt.getTime()) < 5 * 60 * 1000; // within 5 min
        
        if (isNewUser) {
          navigate('/onboarding');
          return;
        }
      }
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    if (!isReset) {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isReset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast({
          title: 'Check your email',
          description: 'We sent you a password reset link.',
        });
        setIsReset(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });
        if (error) throw error;

        // Built-in auth system sends confirmation email automatically
        // Show email verification message instead of navigating
        setShowVerifyEmail(true);
      }
    } catch (error: any) {
      let message = error.message;
      if (message.includes('User already registered')) {
        message = 'This email is already registered. Please sign in instead.';
      } else if (message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (showVerifyEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent a verification link to <span className="font-medium text-foreground">{email}</span>. 
            Click the link to verify your account and start your onboarding.
          </p>
          <p className="text-sm text-muted-foreground">
            Didn't receive it? Check your spam folder or{' '}
            <button 
              onClick={() => setShowVerifyEmail(false)} 
              className="text-primary underline underline-offset-2"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Clarity</h1>
          <p className="text-muted-foreground mt-2">Make decisions with confidence</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">
              {isReset ? 'Reset password' : isLogin ? 'Welcome back' : 'Create account'}
            </CardTitle>
            <CardDescription>
              {isReset 
                ? 'Enter your email to receive a reset link' 
                : isLogin 
                  ? 'Sign in to continue your decisions' 
                  : 'Start making better decisions today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {!isReset && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isReset ? 'Send reset link' : isLogin ? 'Sign in' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm">
              {isReset ? (
                <button
                  type="button"
                  onClick={() => setIsReset(false)}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to sign in
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-muted-foreground hover:text-foreground block w-full"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsReset(true)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Forgot your password?
                    </button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <button onClick={() => navigate('/')} className="hover:text-foreground">
            ← Back to home
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
