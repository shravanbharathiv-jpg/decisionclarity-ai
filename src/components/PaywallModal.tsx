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
import { Loader2, Check, Shield, Sparkles, Crown, BarChart3, Brain, Lock, TrendingUp, Gift, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const EARLY_ADOPTER_PRICING: Record<string, { 
  originalPrice: string;
  price: string; 
  period: string; 
  priceId: string; 
  savings?: string; 
  discount: string;
}> = {
  monthly: { 
    originalPrice: '£9.99',
    price: '£4.99', 
    period: '/month', 
    priceId: 'price_1SjfrMHXuJ6GDDWi0ppujkcu', 
    discount: '50% OFF'
  },
  yearly: { 
    originalPrice: '£69.99',
    price: '£29.99', 
    period: '/year', 
    priceId: 'price_1SjfrSHXuJ6GDDWiWcRS1Vg3', 
    savings: 'Save £40+',
    discount: '57% OFF'
  },
  lifetime: { 
    originalPrice: '£199.99',
    price: '£49.99', 
    period: 'one-time', 
    priceId: 'price_1SjfrUHXuJ6GDDWi0krEVPGU', 
    savings: 'Best Value',
    discount: '75% OFF'
  },
};

export const PaywallModal = ({ open, onClose, onPaymentComplete }: PaywallModalProps) => {
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'lifetime'>('lifetime');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const priceId = EARLY_ADOPTER_PRICING[billingCycle].priceId;
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
    { icon: Sparkles, text: 'Unlimited deep decision analyses' },
    { icon: Brain, text: 'AI-powered bias detection (180+ biases)' },
    { icon: BarChart3, text: 'Decision quality scoring (0-100)' },
    { icon: TrendingUp, text: 'Second-order thinking & scenario modeling' },
    { icon: Crown, text: 'AI predictions & decision templates' },
  ];

  const currentPricing = EARLY_ADOPTER_PRICING[billingCycle];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="flex gap-2 justify-center">
              <Badge className="bg-primary/10 text-primary border-0">
                <Zap className="h-3 w-3 mr-1" />
                Early Adopter
              </Badge>
              <Badge className="bg-destructive text-destructive-foreground border-0">
                {currentPricing.discount}
              </Badge>
            </div>
          </div>
          <DialogTitle className="text-xl md:text-2xl">Unlock Unlimited Clarity</DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Make every decision with confidence — your thinking deserves the best tools available
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-4">
          {/* Billing toggle */}
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs relative">
                Yearly
                <span className="absolute -top-2 -right-1 text-[8px] bg-green-500 text-white px-1 rounded">-57%</span>
              </TabsTrigger>
              <TabsTrigger value="lifetime" className="text-xs relative">
                Lifetime
                <span className="absolute -top-2 -right-1 text-[8px] bg-destructive text-white px-1 rounded">-75%</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-muted-foreground line-through decoration-2">
                {currentPricing.originalPrice}
              </span>
              <span className="text-3xl md:text-4xl font-bold text-foreground">{currentPricing.price}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {currentPricing.period === 'one-time' ? 'One-time payment • Own forever' : `per ${currentPricing.period.replace('/', '')}`}
            </p>
            {currentPricing.savings && (
              <Badge variant="secondary" className="mt-2 bg-green-500/10 text-green-600">
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
                <ArrowRight className="h-4 w-4" />
                Unlock Unlimited Clarity
              </>
            )}
          </Button>

          <div className="space-y-1.5">
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              7-day money-back guarantee • Price locked forever
            </p>
            <p className="text-xs text-center text-muted-foreground">
              Early adopter pricing — these prices won't be available forever
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
