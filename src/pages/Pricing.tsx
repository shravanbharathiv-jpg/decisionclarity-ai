import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ArrowLeft, Sparkles, Zap, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying Clarity',
    features: [
      '3 decisions per month',
      'Basic AI insights',
      'Bias detection',
      'Scenario modeling',
    ],
    icon: Zap,
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$15',
    period: '/month',
    description: 'For serious decision makers',
    priceId: 'price_1Sj65jHXuJ6GDDWiUuZKjNV6',
    features: [
      'Unlimited decisions',
      'Advanced AI analysis',
      'Second-order thinking',
      'Decision comparisons',
      'Bias profile & patterns',
      '30/90/180 day reflections',
      'Priority support',
    ],
    icon: Sparkles,
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: '$120',
    period: '/year',
    description: 'Save 33% - Best value',
    priceId: 'price_1Sj66VHXuJ6GDDWieTzYLN2Z',
    features: [
      'Everything in Pro Monthly',
      '4 months free',
      'Early access to new features',
      'Founding member badge',
    ],
    icon: Crown,
    popular: false,
  },
];

const Pricing = () => {
  const { user, hasPaid, subscriptionTier } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(planId);

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create checkout session',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('manage');
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to open customer portal',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(user ? '/dashboard' : '/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-semibold text-foreground tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your decision-making needs. Cancel anytime.
          </p>
          {hasPaid && (
            <Badge variant="secondary" className="text-sm">
              Current plan: {subscriptionTier === 'lifetime' ? 'Lifetime Access' : 'Pro'}
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = 
              (plan.id === 'free' && !hasPaid) ||
              (plan.id !== 'free' && hasPaid && subscriptionTier !== 'lifetime');
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : 'border-border/50'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.id === 'free' ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(user ? '/dashboard' : '/auth')}
                    >
                      {user ? 'Continue Free' : 'Get Started'}
                    </Button>
                  ) : isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleManageSubscription}
                      disabled={loading === 'manage'}
                    >
                      {loading === 'manage' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleSubscribe(plan.priceId!, plan.id)}
                      disabled={loading === plan.id || hasPaid}
                    >
                      {loading === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {hasPaid ? 'Already Subscribed' : 'Subscribe'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day money-back guarantee. No questions asked.
          </p>
          <p className="text-sm text-muted-foreground">
            Secure payment powered by Stripe. Your data is always protected.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;