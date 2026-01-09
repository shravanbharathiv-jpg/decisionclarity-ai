import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Layers, Link2, Lightbulb, CheckCircle2, Zap, Clock, DoorOpen, DoorClosed, Repeat } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';

interface StepSecondOrderProps {
  decision: Decision;
  onUpdate: (updates: Partial<Decision>) => Promise<boolean>;
  onNext: () => void;
}

const secondOrderCategories = [
  {
    icon: DoorOpen,
    title: 'Doors Opened',
    description: 'What new opportunities does this create?',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: DoorClosed,
    title: 'Doors Closed',
    description: 'What options become unavailable?',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Repeat,
    title: 'Habits Formed',
    description: 'What patterns or behaviors does this reinforce?',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
];

export const StepSecondOrder = ({ decision, onUpdate, onNext }: StepSecondOrderProps) => {
  const [secondOrderEffects, setSecondOrderEffects] = useState(decision.second_order_effects || '');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analysis, setAnalysis] = useState(decision.ai_second_order_analysis || '');
  const [showCategories, setShowCategories] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!analysis) {
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Step 5 of 6</span>
            <span className="font-medium text-primary">Second-Order Thinking</span>
          </div>
          <Progress value={83} className="h-2" />
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <Badge className="w-fit mx-auto mb-3 bg-blue-500/10 text-blue-500 border-blue-500/20">
              <Layers className="h-3 w-3 mr-1" />
              Think Deeper
            </Badge>
            <CardTitle className="text-xl">{decision.title}</CardTitle>
            <CardDescription>
              Second-order thinking helps you see the ripple effects of your decision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {generating ? (
              <div className="text-center py-12 space-y-4 animate-pulse">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <Layers className="absolute inset-0 m-auto h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Mapping second-order effects...</p>
                <p className="text-xs text-muted-foreground">Looking beyond the obvious consequences</p>
              </div>
            ) : (
              <>
                {/* Category explanation */}
                {showCategories && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in slide-in-from-top duration-300">
                    {secondOrderCategories.map((cat, i) => (
                      <div 
                        key={i}
                        className={`p-3 rounded-lg ${cat.bgColor} text-center`}
                      >
                        <cat.icon className={`h-6 w-6 ${cat.color} mx-auto mb-2`} />
                        <p className="text-sm font-medium">{cat.title}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Analysis */}
                {analysis && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="font-semibold">AI Analysis</h3>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <FormattedText content={analysis} />
                    </div>
                  </div>
                )}

                {/* User reflection */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <Label className="text-base font-medium">Your Reflection</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on this analysis, what long-term effects are you consciously accepting?
                  </p>
                  
                  <Textarea
                    value={secondOrderEffects}
                    onChange={(e) => setSecondOrderEffects(e.target.value)}
                    placeholder="By making this decision, I acknowledge that...

• It will open doors to...
• It may close off...
• It reinforces my pattern of..."
                    rows={5}
                    className="resize-none"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{secondOrderEffects.length > 0 ? `${secondOrderEffects.length} characters` : 'Optional, but recommended'}</span>
                  </div>
                </div>

                {/* Key insight callout */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Pro Tip</p>
                      <p className="text-xs text-muted-foreground">
                        The best decision-makers don't just think about what happens next—they think about 
                        what happens after what happens next. This habit compounds over time.
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleContinue} className="w-full gap-2" size="lg" disabled={loading}>
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
