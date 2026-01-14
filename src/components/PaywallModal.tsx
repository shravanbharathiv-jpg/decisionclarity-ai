import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Shield, Sparkles, Crown, BarChart3, Brain, Lock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const PRICING: Record<string, { price: string; period: string; priceId: string; savings?: string; trial?: string }> = {
  monthly: { price: '£9.99', period: '/month', priceId: 'price_1SjfrMHXuJ6GDDWi0ppujkcu', trial: '7-day free trial' },
  yearly: { price: '£69.99', period: '/year', priceId: 'price_1SjfrSHXuJ6GDDWiWcRS1Vg3', savings: 'Save 42%', trial: '7-day free trial' },
  lifetime: { price: '£99.99', period: 'one-time', priceId: 'price_1SjfrUHXuJ6GDDWi0krEVPGU', savings: 'Best Value' },
};

export const PaywallModal = ({ open, onClose, onPaymentComplete }: PaywallModalProps) => {
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = async () => {
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
        onPaymentComplete();
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Sparkles, text: 'Scenario modeling (best/worst/likely)' },
    { icon: Brain, text: 'AI-powered bias detection' },
    { icon: BarChart3, text: 'Decision quality scoring (0-100)' },
    { icon: TrendingUp, text: 'Second-order thinking analysis' },
    { icon: Crown, text: 'Decision templates library' },
  ];

  const currentPricing = PRICING[billingCycle];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2">
            <Badge className="bg-primary/10 text-primary border-0">
              <Lock className="h-3 w-3 mr-1" />
              Premium Feature
            </Badge>
          </div>
          <DialogTitle className="text-xl md:text-2xl">Unlock Full Access</DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Continue with AI-powered scenario modeling and more
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-4">
          {/* Billing toggle */}
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs relative">
                Yearly
                <span className="absolute -top-2 -right-1 text-[8px] bg-green-500 text-white px-1 rounded">-42%</span>
              </TabsTrigger>
              <TabsTrigger value="lifetime" className="text-xs">Lifetime</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground">{currentPricing.price}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {currentPricing.period === 'one-time' ? 'One-time payment • Own forever' : `per ${currentPricing.period.replace('/', '')}`}
            </p>
            {currentPricing.trial && (
              <Badge variant="outline" className="mt-2 text-xs">
                {currentPricing.trial}
              </Badge>
            )}
            {currentPricing.savings && (
              <Badge variant="secondary" className="mt-2 ml-2 bg-green-500/10 text-green-600">
                {currentPricing.savings}
              </Badge>
            )}
          </div>

          <ul className="space-y-2 md:space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-xs md:text-sm">
                <feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>

          <Button 
            onClick={handleCheckout} 
            className="w-full gap-2" 
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Upgrade to Pro
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            7-day money-back guarantee • Secure payment via Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};