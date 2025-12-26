import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';

interface StepBiasCheckProps {
  decision: Decision;
  onUpdate: (updates: Partial<Decision>) => Promise<boolean>;
  onNext: () => void;
}

export const StepBiasCheck = ({ decision, onUpdate, onNext }: StepBiasCheckProps) => {
  const [loading, setLoading] = useState(false);
  const [biases, setBiases] = useState<string[]>(decision.detected_biases || []);
  const [explanation, setExplanation] = useState(decision.ai_bias_explanation || '');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!explanation) {
      runBiasCheck();
    }
  }, []);

  const runBiasCheck = async () => {
    setLoading(true);
    try {
      const allResponses = {
        'Time horizon': decision.time_horizon || '',
        'Reversibility': decision.is_reversible || '',
        'If do nothing': decision.do_nothing_outcome || '',
        'Biggest fear': decision.biggest_fear || '',
        'Future regret': decision.future_regret || '',
        'Best case scenario': decision.best_case_scenario || '',
        'Most likely scenario': decision.likely_case_scenario || '',
        'Worst case scenario': decision.worst_case_scenario || '',
      };

      const { data, error } = await supabase.functions.invoke('analyze-decision', {
        body: {
          type: 'bias',
          decisionTitle: decision.title,
          decisionDescription: decision.description,
          allResponses,
        },
      });

      if (error) throw error;

      setBiases(data.biases || []);
      setExplanation(data.analysis);
      
      await onUpdate({
        detected_biases: data.biases || [],
        ai_bias_explanation: data.analysis,
      });
    } catch (error: any) {
      console.error('Error running bias check:', error);
      toast({
        title: 'Error checking for biases',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-xl">
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Step 4 of 5</div>
            <CardTitle className="text-xl">{decision.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Analyzing for cognitive biases...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-semibold">Cognitive Bias Check</h3>
                </div>

                {biases.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {biases.map((bias, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-destructive/10 text-destructive"
                      >
                        {bias}
                      </span>
                    ))}
                  </div>
                )}

                <FormattedText content={explanation} />

                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Remember: Having biases doesn't mean your decision is wrong. 
                      Awareness is the first step to making a clearer choice.
                    </span>
                  </p>
                </div>

                <Button onClick={handleContinue} className="w-full gap-2">
                  Continue to Final Decision
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
