import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ArrowLeft, Sparkles, Crown, Clock, Shield, Zap, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EARLY_ADOPTER_PLANS = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    originalPrice: '£9.99',
    discountedPrice: '£4.99',
    period: '/month',
    description: 'Early adopter special',
    priceId: 'price_1SjfrMHXuJ6GDDWi0ppujkcu',
    discount: '50% OFF',
    features: [
      'Unlimited decisions',
      'AI scenario modeling',
      'Cognitive bias detection',
      'Second-order thinking',
      'Decision templates',
      'Decision scoring',
    ],
    icon: Sparkles,
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    originalPrice: '£69.99',
    discountedPrice: '£29.99',
    period: '/year',
    description: 'Best value for early adopters',
    priceId: 'price_1SjfrSHXuJ6GDDWiWcRS1Vg3',
    discount: '57% OFF',
    features: [
      'Everything in Pro Monthly',
      '7+ months FREE savings',
      'Early access to new features',
      'Priority support',
    ],
    icon: Crown,
    popular: true,
    savings: 'Save £30+',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    originalPrice: '£199.99',
    discountedPrice: '£49.99',
    period: 'one-time',
    description: 'Pay once, own forever',
    priceId: 'price_1SjfrUHXuJ6GDDWi0krEVPGU',
    discount: '75% OFF',
    features: [
      'Everything in Pro',
      'Never pay again',
      'All future features included',
      'Founding member status',
    ],
    icon: Gift,
    popular: false,
    savings: 'Save £150',
  },
];

const EarlyAdopterPricing = () => {
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

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Special Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Early Adopter Exclusive</span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
            Thank You for Being Early 🎉
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            As one of our first users, you get <span className="text-primary font-semibold">exclusive lifetime discounts</span> that will never be offered again.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
              <Clock className="h-3.5 w-3.5" />
              7-day free trial on all plans
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
              <Shield className="h-3.5 w-3.5" />
              Cancel anytime
            </Badge>
          </div>
        </div>

        {/* Countdown urgency */}
        <div className="text-center mb-10">
          <p className="text-sm text-muted-foreground">
            🔥 <span className="text-foreground font-medium">These prices are locked in forever</span> when you subscribe today
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {EARLY_ADOPTER_PLANS.map((plan) => {
            const Icon = plan.icon;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular 
                    ? 'border-primary shadow-xl ring-2 ring-primary/20' 
                    : 'border-border/50 hover:border-primary/50'
                }`}
              >
                {/* Discount Badge */}
                <div className="absolute -right-8 top-6 rotate-45 bg-destructive text-destructive-foreground px-10 py-1 text-xs font-bold">
                  {plan.discount}
                </div>

                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary py-1.5 text-center">
                    <span className="text-xs font-semibold text-primary-foreground">MOST POPULAR</span>
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-10' : 'pt-6'} pb-4`}>
                  <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  
                  <div className="pt-4 space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg text-muted-foreground line-through decoration-2">
                        {plan.originalPrice}
                      </span>
                      <span className="text-3xl font-bold text-foreground">{plan.discountedPrice}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {plan.period === 'one-time' ? 'one-time payment' : plan.period}
                    </span>
                    {plan.savings && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 mt-2">
                        {plan.savings}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleSubscribe(plan.priceId, plan.id)}
                    disabled={loading === plan.id || hasPaid}
                  >
                    {loading === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {hasPaid ? 'Already Subscribed' : 'Start 7-Day Free Trial'}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    No payment required to start
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Elements */}
        <div className="mt-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">7-Day Money Back Guarantee</span>
          </div>
          
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Not satisfied? Get a full refund within 7 days, no questions asked. Your early adopter pricing is <span className="text-foreground font-medium">locked in forever</span>—even if our prices increase later.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
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
              Price locked forever
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EarlyAdopterPricing;