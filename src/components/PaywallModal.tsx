import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Check, Shield } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export const PaywallModal = ({ open, onClose, onPaymentComplete }: PaywallModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe checkout in new tab
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
    'AI-powered decision insights',
    'Cognitive bias detection',
    'Scenario analysis',
    'Permanent decision records',
    'Lifetime access',
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">Unlock Full Access</DialogTitle>
          <DialogDescription className="text-base">
            Complete your decision with AI-powered insights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">£39</div>
            <p className="text-sm text-muted-foreground mt-1">One-time payment • Lifetime access</p>
          </div>

          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{feature}</span>
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
                <CreditCard className="h-4 w-4" />
                Continue to payment
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Secure payment via Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
