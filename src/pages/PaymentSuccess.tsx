import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const PaymentSuccess = () => {
  const { checkPaymentStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh payment status
    checkPaymentStatus();
  }, [checkPaymentStatus]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full border-border/50 text-center">
        <CardHeader className="space-y-4 pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Payment successful</CardTitle>
          <CardDescription className="text-base">
            Thank you for your purchase. You now have lifetime access to Clarity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            All premium features are now unlocked. Continue making decisions with confidence.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Continue to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
