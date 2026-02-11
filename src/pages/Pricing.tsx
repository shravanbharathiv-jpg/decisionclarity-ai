import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ArrowLeft, Sparkles, Zap, Crown, X, BarChart3, Brain, TrendingUp, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    period: 'forever',
    description: 'Try the basics',
    features: [
      { text: '5 quick decisions per month', included: true },
      { text: 'No deep decisions (Pro only)', included: false },
      { text: 'Basic decision deconstruction', included: true },
      { text: 'Scenario modeling', included: false },
      { text: 'AI bias detection', included: false },
      { text: 'Second-order thinking', included: false },
      { text: 'AI decision scoring', included: false },
      { text: 'Decision templates', included: false },
      { text: 'Comparison mode', included: false },
    ],
    icon: Zap,
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '£9.99',
    period: '/month',
    description: 'For serious decision makers',
    priceId: 'price_1SjfrMHXuJ6GDDWi0ppujkcu',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited deep decisions', included: true },
      { text: 'Unlimited quick decisions', included: true },
      { text: 'Scenario modeling', included: true },
      { text: 'AI bias detection', included: true },
      { text: 'Second-order thinking', included: true },
      { text: 'Decision templates', included: true },
    ],
    icon: Sparkles,
    popular: false,
    trial: '7-day free trial',
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: '£69.99',
    period: '/year',
    description: 'Save 42% vs monthly',
    priceId: 'price_1SjfrSHXuJ6GDDWiWcRS1Vg3',
    features: [
      { text: 'Everything in Pro Monthly', included: true },
      { text: 'Save over £49 per year', included: true },
      { text: 'Early access to new features', included: true },
    ],
    icon: Crown,
    popular: false,
    savings: 'Save 42%',
    trial: '7-day free trial',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '£99.99',
    period: 'one-time',
    description: 'Pay once, own forever',
    priceId: 'price_1SjfrUHXuJ6GDDWi0krEVPGU',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'No recurring payments ever', included: true },
      { text: 'All future features included', included: true },
    ],
    icon: Crown,
    popular: true,
    savings: 'Best Value',
    trial: '7-day free trial',
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
      const functionName = planId === 'lifetime' ? 'create-payment' : 'create-subscription';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
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

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-2xl md:text-4xl font-semibold text-foreground tracking-tight">
            Choose Your Clarity Plan
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            One good decision can pay for this forever. Cancel anytime.
          </p>
          {hasPaid && (
            <Badge variant="secondary" className="text-sm">
              Current plan: {subscriptionTier === 'lifetime' ? 'Lifetime Access' : 'Pro'}
            </Badge>
          )}
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12 max-w-3xl mx-auto">
          {[
            { icon: Sparkles, label: 'Scenario Modeling', desc: 'Best/worst/likely' },
            { icon: Brain, label: 'Bias Detection', desc: 'AI-powered' },
            { icon: BarChart3, label: 'Decision Scoring', desc: '0-100 quality score' },
            { icon: TrendingUp, label: 'Second-Order', desc: 'See ripple effects' },
          ].map((item, i) => (
            <div key={i} className="text-center p-3 md:p-4 rounded-lg bg-muted/30">
              <item.icon className="h-5 w-5 md:h-6 md:w-6 text-primary mx-auto mb-2" />
              <p className="text-xs md:text-sm font-medium">{item.label}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
                {plan.savings && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                      {plan.savings}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 p-2 rounded-full bg-primary/10 w-fit">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  <div className="pt-3">
                    <span className="text-2xl md:text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period !== 'forever' && plan.period !== 'one-time' ? plan.period : ` ${plan.period}`}</span>
                  </div>
                  {plan.trial && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {plan.trial}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-xs ${feature.included ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                          {feature.text}
                        </span>
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
                      Manage
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(plan.priceId!, plan.id)}
                      disabled={loading === plan.id || hasPaid}
                    >
                      {loading === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {hasPaid ? 'Current' : 'Upgrade'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 md:mt-12 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">7-Day Money Back Guarantee</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            ✓ Full refund within 7 days, no questions asked • ✓ Cancel anytime • ✓ Secure payment via Stripe
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
