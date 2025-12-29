import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Loader2, ArrowLeft, Sparkles, Crown, Zap, X, Lock, BarChart3, Users, Brain, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Try Clarity basics',
    features: [
      { name: 'Basic decision deconstruction', included: true },
      { name: '3 decisions per month', included: true },
      { name: 'Scenario modeling', included: false },
      { name: 'AI bias detection', included: false },
      { name: 'Second-order thinking', included: false },
      { name: 'AI decision scoring', included: false },
      { name: 'Decision templates', included: false },
      { name: 'Advisor sharing', included: false },
      { name: 'Comparison mode', included: false },
      { name: 'Long-term reflections', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Full decision system',
    features: [
      { name: 'Basic decision deconstruction', included: true },
      { name: 'Unlimited decisions', included: true },
      { name: 'Scenario modeling', included: true },
      { name: 'AI bias detection', included: true },
      { name: 'Second-order thinking', included: true },
      { name: 'AI decision scoring', included: true },
      { name: 'Decision templates', included: true },
      { name: 'Advisor sharing', included: true },
      { name: 'Comparison mode', included: true },
      { name: 'Long-term reflections', included: true },
    ],
  },
};

const PRICING = {
  monthly: { price: '£9.99', period: '/month', priceId: 'price_1SjfrMHXuJ6GDDWi0ppujkcu', savings: null },
  yearly: { price: '£69.99', period: '/year', priceId: 'price_1SjfrSHXuJ6GDDWiWcRS1Vg3', savings: 'Save 42%' },
  lifetime: { price: '£99.99', period: 'one-time', priceId: 'price_1SjfrUHXuJ6GDDWi0krEVPGU', savings: 'Best Value' },
};

const Upgrade = () => {
  const { user, hasPaid, subscriptionTier } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const priceId = PRICING[billingCycle].priceId;
      const functionName = billingCycle === 'lifetime' ? 'create-payment' : 'create-subscription';
      
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
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const currentPricing = PRICING[billingCycle];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center space-y-4 mb-8">
          <Badge className="bg-primary/10 text-primary border-0">
            <Lock className="h-3 w-3 mr-1" />
            Premium Feature
          </Badge>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Unlock Scenario Modeling & More
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            You've discovered a Pro feature. Upgrade to access the full decision-making system.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Sparkles, label: 'Scenario Modeling' },
            { icon: Brain, label: 'Bias Detection' },
            { icon: BarChart3, label: 'AI Scoring' },
            { icon: Users, label: 'Advisor Sharing' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <item.icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-center">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-8">
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="relative">
                Yearly
                {PRICING.yearly.savings && (
                  <Badge className="absolute -top-3 -right-3 text-[10px] bg-green-500 text-white">
                    {PRICING.yearly.savings}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="lifetime" className="relative">
                Lifetime
                {PRICING.lifetime.savings && (
                  <Badge className="absolute -top-3 -right-3 text-[10px] bg-primary">
                    {PRICING.lifetime.savings}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Plan comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free plan */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{PLANS.free.name}</CardTitle>
              </div>
              <CardDescription>{PLANS.free.description}</CardDescription>
              <div className="pt-2">
                <span className="text-3xl font-bold">£0</span>
                <span className="text-muted-foreground"> forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {PLANS.free.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-6"
                onClick={() => navigate('/dashboard')}
              >
                Continue Free
              </Button>
            </CardContent>
          </Card>

          {/* Pro plan */}
          <Card className="border-primary shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{PLANS.pro.name}</CardTitle>
              </div>
              <CardDescription>{PLANS.pro.description}</CardDescription>
              <div className="pt-2">
                <span className="text-3xl font-bold">{currentPricing.price}</span>
                <span className="text-muted-foreground"> {currentPricing.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {PLANS.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
              {hasPaid ? (
                <Button 
                  variant="outline" 
                  className="w-full mt-6"
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Manage Subscription
                </Button>
              ) : (
                <Button 
                  className="w-full mt-6"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upgrade to Pro
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            ✓ 7-day money-back guarantee • ✓ Cancel anytime • ✓ Secure payment via Stripe
          </p>
        </div>
      </main>
    </div>
  );
};

export default Upgrade;
