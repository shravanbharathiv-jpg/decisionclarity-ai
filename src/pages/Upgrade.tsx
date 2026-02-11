import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ArrowLeft, Sparkles, Crown, Zap, X, Lock, BarChart3, Brain, TrendingUp, Gift, Shield } from 'lucide-react';
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
      { name: 'Comparison mode', included: true },
      { name: 'Long-term reflections', included: true },
    ],
  },
};

const EARLY_ADOPTER_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    originalPrice: '£9.99',
    price: '£4.99',
    period: '/month',
    priceId: 'price_1SjfrMHXuJ6GDDWi0ppujkcu',
    discount: '50% OFF',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    originalPrice: '£69.99',
    price: '£29.99',
    period: '/year',
    priceId: 'price_1SjfrSHXuJ6GDDWiWcRS1Vg3',
    discount: '57% OFF',
    savings: 'Save £30+',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    originalPrice: '£199.99',
    price: '£49.99',
    period: 'one-time',
    priceId: 'price_1SjfrUHXuJ6GDDWi0krEVPGU',
    discount: '75% OFF',
    savings: 'Best Value',
    popular: true,
  },
];

const Upgrade = () => {
  const { user, hasPaid } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('lifetime');
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
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Early Adopter Exclusive</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Unlock Full Access at Exclusive Prices
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            As an early adopter, you get <span className="text-primary font-semibold">lifetime discounts</span> that will never be offered again.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {[
            { icon: Sparkles, label: 'Scenario Modeling' },
            { icon: Brain, label: 'Bias Detection' },
            { icon: BarChart3, label: 'AI Scoring' },
            { icon: TrendingUp, label: 'Second-Order' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-primary/5 border border-primary/10">
              <item.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="text-xs md:text-sm font-medium text-center">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Early Adopter Plans */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {EARLY_ADOPTER_PLANS.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-300 ${
                plan.popular 
                  ? 'border-primary shadow-xl ring-2 ring-primary/20' 
                  : 'border-border/50 hover:border-primary/50'
              } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {/* Discount Badge */}
              <div className="absolute -right-6 top-4 rotate-45 bg-destructive text-destructive-foreground px-8 py-1 text-xs font-bold">
                {plan.discount}
              </div>

              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary py-1.5 text-center rounded-t-lg">
                  <span className="text-xs font-semibold text-primary-foreground">BEST VALUE</span>
                </div>
              )}

              <CardHeader className={`text-center ${plan.popular ? 'pt-10' : 'pt-6'}`}>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="pt-2 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base text-muted-foreground line-through">
                      {plan.originalPrice}
                    </span>
                    <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {plan.period === 'one-time' ? 'one-time' : plan.period}
                  </span>
                  {plan.savings && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <Button 
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(plan.priceId, plan.id);
                  }}
                  disabled={loading === plan.id || hasPaid}
                >
                  {loading === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {hasPaid ? 'Already Subscribed' : (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      Claim This Price
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What's included */}
        <Card className="border-primary/20 bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              What's Included in Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {PLANS.pro.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trust elements */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">7-Day Money Back Guarantee</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your early adopter price is <span className="text-foreground font-medium">locked in forever</span>—even if we raise prices later.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-green-500" />
              Secure Stripe checkout
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-green-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-green-500" />
              Instant access
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upgrade;