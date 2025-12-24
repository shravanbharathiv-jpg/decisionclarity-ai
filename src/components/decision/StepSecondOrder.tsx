import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';

interface StepSecondOrderProps {
  decision: Decision;
  onUpdate: (updates: Partial<Decision>) => Promise<boolean>;
  onNext: () => void;
}

export const StepSecondOrder = ({ decision, onUpdate, onNext }: StepSecondOrderProps) => {
  const [secondOrderEffects, setSecondOrderEffects] = useState(decision.second_order_effects || '');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analysis, setAnalysis] = useState(decision.ai_second_order_analysis || '');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!analysis && decision.final_decision) {
      generateAnalysis();
    }
  }, []);

  const generateAnalysis = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-reflection', {
        body: {
          type: 'second_order',
          decisionTitle: decision.title,
          currentContext: `
            Decision: ${decision.final_decision || decision.title}
            Best case: ${decision.best_case_scenario || 'Not specified'}
            Likely case: ${decision.likely_case_scenario || 'Not specified'}
            Worst case: ${decision.worst_case_scenario || 'Not specified'}
            Detected biases: ${decision.detected_biases?.join(', ') || 'None detected'}
          `,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      await onUpdate({ ai_second_order_analysis: data.analysis });
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      toast({
        title: 'Error generating analysis',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    await onUpdate({ second_order_effects: secondOrderEffects });
    onNext();
    setLoading(false);
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
            <div className="text-sm text-muted-foreground mb-2">Step 5 of 6</div>
            <CardTitle className="text-xl">{decision.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {generating ? (
              <div className="text-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Analyzing second-order effects...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-semibold">Second-Order Effects</h3>
                </div>

                {analysis && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <FormattedText content={analysis} />
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Your reflection</Label>
                    <p className="text-sm text-muted-foreground">
                      Based on this analysis, what second-order effects are you accepting?
                    </p>
                  </div>
                  
                  <Textarea
                    value={secondOrderEffects}
                    onChange={(e) => setSecondOrderEffects(e.target.value)}
                    placeholder="I acknowledge that this decision will..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button onClick={handleContinue} className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continue to Final Decision
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
