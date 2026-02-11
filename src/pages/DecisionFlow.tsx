import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { StepDeconstruction } from '@/components/decision/StepDeconstruction';
import { StepScenarios } from '@/components/decision/StepScenarios';
import { StepBiasCheck } from '@/components/decision/StepBiasCheck';
import { StepSecondOrder } from '@/components/decision/StepSecondOrder';
import { StepLock } from '@/components/decision/StepLock';
import { DecisionComplete } from '@/components/decision/DecisionComplete';
import { PaywallModal } from '@/components/PaywallModal';
import { Decision } from '@/types/decision';

const DecisionFlow = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, hasPaid, checkPaymentStatus } = useAuth();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchDecision = async () => {
      if (!id || !user) return;

      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast({
          title: 'Decision not found',
          description: 'This decision does not exist or you do not have access.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      const parsedDecision = {
        ...data,
        detected_biases: data.detected_biases ? 
          (typeof data.detected_biases === 'string' 
            ? JSON.parse(data.detected_biases) 
            : data.detected_biases) 
          : null
      };

      setDecision(parsedDecision as Decision);
      setLoading(false);
    };

    if (user) {
      fetchDecision();
    }
  }, [id, user, navigate, toast]);

  const updateDecision = async (updates: Partial<Decision>) => {
    if (!decision) return false;

    const { error } = await supabase
      .from('decisions')
      .update(updates)
      .eq('id', decision.id);

    if (error) {
      toast({
        title: 'Error saving',
        description: 'Failed to save your progress. Please try again.',
        variant: 'destructive',
      });
      return false;
    }

    setDecision({ ...decision, ...updates });
    return true;
  };

  const handleNextStep = async () => {
    if (!decision) return;
    
    // Free users cannot access deep decisions at all - hard paywall
    if (!hasPaid) {
      navigate('/upgrade');
      return;
    }

    const newStep = decision.current_step + 1;
    await updateDecision({ current_step: newStep });
  };

  const handlePaymentComplete = async () => {
    setShowPaywall(false);
    await checkPaymentStatus();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!decision) {
    return null;
  }

  if (decision.is_locked) {
    return <DecisionComplete decision={decision} />;
  }

  const renderStep = () => {
    switch (decision.current_step) {
      case 2:
        return (
          <StepDeconstruction
            decision={decision}
            onUpdate={updateDecision}
            onNext={handleNextStep}
            hasPaid={hasPaid}
          />
        );
      case 3:
        return (
          <StepScenarios
            decision={decision}
            onUpdate={updateDecision}
            onNext={handleNextStep}
          />
        );
      case 4:
        return (
          <StepBiasCheck
            decision={decision}
            onUpdate={updateDecision}
            onNext={handleNextStep}
          />
        );
      case 5:
        return (
          <StepSecondOrder
            decision={decision}
            onUpdate={updateDecision}
            onNext={handleNextStep}
          />
        );
      case 6:
        return (
          <StepLock
            decision={decision}
            onUpdate={updateDecision}
          />
        );
      default:
        navigate('/dashboard');
        return null;
    }
  };

  return (
    <>
      {renderStep()}
      <PaywallModal 
        open={showPaywall} 
        onClose={() => setShowPaywall(false)}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
};

export default DecisionFlow;
