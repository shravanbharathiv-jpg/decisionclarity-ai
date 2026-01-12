import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle, Sparkles, Brain, CheckCircle2, Info } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';

interface StepBiasCheckProps {
  decision: Decision;
  onUpdate: (updates: Partial<Decision>) => Promise<boolean>;
  onNext: () => void;
}

const COMMON_BIASES = [
  {
    name: 'Confirmation Bias',
    description: 'Seeking information that confirms what you already believe',
    question: 'Have you actively sought out opposing viewpoints?',
  },
  {
    name: 'Sunk Cost Fallacy',
    description: 'Continuing because of past investment rather than future value',
    question: 'Would you make this same choice if you were starting fresh today?',
  },
  {
    name: 'Availability Bias',
    description: 'Overweighting recent or memorable experiences',
    question: 'Is a recent event disproportionately influencing this decision?',
  },
  {
    name: 'Anchoring',
    description: 'Over-relying on the first piece of information encountered',
    question: 'Has initial information locked you into a specific viewpoint?',
  },
  {
    name: 'Loss Aversion',
    description: 'Fearing losses more than valuing equivalent gains',
    question: 'Are you avoiding this choice primarily to prevent loss?',
  },
  {
    name: 'Optimism Bias',
    description: 'Believing you are less likely to experience negative outcomes',
    question: 'Are you assuming things will work out better for you than for others?',
  },
];

export const StepBiasCheck = ({ decision, onUpdate, onNext }: StepBiasCheckProps) => {
  const [loading, setLoading] = useState(false);
  const [biases, setBiases] = useState<string[]>(decision.detected_biases || []);
  const [explanation, setExplanation] = useState(decision.ai_bias_explanation || '');
  const [acknowledgedBiases, setAcknowledgedBiases] = useState<string[]>([]);
  const [step, setStep] = useState<'check' | 'acknowledge' | 'result'>('check');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (explanation) {
      setStep('result');
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
          acknowledgedBiases,
        },
      });

      if (error) throw error;

      setBiases(data.biases || []);
      setExplanation(data.analysis);
      
      await onUpdate({
        detected_biases: data.biases || [],
        ai_bias_explanation: data.analysis,
      });
      
      setStep('result');
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

  const toggleBias = (biasName: string) => {
    setAcknowledgedBiases(prev => 
      prev.includes(biasName) 
        ? prev.filter(b => b !== biasName)
        : [...prev, biasName]
    );
  };

  const handleContinue = () => {
    onNext();
  };

  const handleProceedToCheck = () => {
    setStep('acknowledge');
  };

  if (step === 'result') {
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

        <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-2xl">
          <Card className="border-border/50">
            <CardHeader className="text-center px-3 sm:px-6">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Step 4 of 5</div>
              <CardTitle className="text-lg sm:text-xl">{decision.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 text-primary">
                <Brain className="h-5 w-5" />
                <h3 className="font-semibold">Bias Analysis Complete</h3>
              </div>

              {biases.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Potential biases detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {biases.map((bias, index) => (
                      <Badge
                        key={index}
                        variant="destructive"
                        className="bg-destructive/10 text-destructive border-destructive/20"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {bias}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-3 sm:p-4 max-h-[35vh] overflow-y-auto">
                <FormattedText content={explanation} />
              </div>

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-sm flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span>
                    <strong>Remember:</strong> Having biases doesn't mean your decision is wrong. 
                    Awareness is the first step to making a clearer choice. You've already shown 
                    wisdom by examining these patterns.
                  </span>
                </p>
              </div>

              <Button onClick={handleContinue} className="w-full gap-2">
                Continue to Second-Order Effects
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (step === 'acknowledge') {
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

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Step 4 of 5 • Self-Assessment</div>
              <CardTitle className="text-xl">Acknowledge Your Biases</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Select any biases you think might be affecting your thinking
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {COMMON_BIASES.map((bias) => (
                <div
                  key={bias.name}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    acknowledgedBiases.includes(bias.name)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/80'
                  }`}
                  onClick={() => toggleBias(bias.name)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={acknowledgedBiases.includes(bias.name)}
                      onCheckedChange={() => toggleBias(bias.name)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{bias.name}</span>
                        {acknowledgedBiases.includes(bias.name) && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{bias.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">{bias.question}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('check')} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={runBiasCheck} disabled={loading} className="flex-1">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get AI Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
            <div className="text-center p-6 rounded-lg bg-orange-500/10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4">
                <Brain className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cognitive Bias Check</h3>
              <p className="text-sm text-muted-foreground">
                We all have blind spots. Let's identify any biases that might be 
                influencing your decision-making.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">What we'll check:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Confirmation bias - seeking only supporting evidence
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Sunk cost fallacy - letting past investment cloud judgment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Availability bias - overweighting recent experiences
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  And more based on your specific situation...
                </li>
              </ul>
            </div>

            <Button onClick={handleProceedToCheck} className="w-full gap-2">
              Start Bias Check
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
