import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface StepScenariosProps {
  decision: Decision;
  onUpdate: (updates: Partial<Decision>) => Promise<boolean>;
  onNext: () => void;
}

const scenarios = [
  {
    key: 'best_case_scenario',
    title: 'Best Realistic Case',
    description: 'What does the best realistic outcome look like if you take action?',
    placeholder: 'Describe the best outcome you could reasonably expect...',
  },
  {
    key: 'likely_case_scenario',
    title: 'Most Likely Case',
    description: 'What is the most probable outcome?',
    placeholder: 'Describe what will most likely happen...',
  },
  {
    key: 'worst_case_scenario',
    title: 'Worst Realistic Case',
    description: 'What is the worst realistic outcome?',
    placeholder: 'Describe the worst outcome you could reasonably expect...',
  },
];

export const StepScenarios = ({ decision, onUpdate, onNext }: StepScenariosProps) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [answers, setAnswers] = useState({
    best_case_scenario: decision.best_case_scenario || '',
    likely_case_scenario: decision.likely_case_scenario || '',
    worst_case_scenario: decision.worst_case_scenario || '',
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analysis, setAnalysis] = useState(decision.ai_scenario_analysis || '');
  const navigate = useNavigate();
  const { toast } = useToast();

  const scenario = scenarios[currentScenario];
  const currentAnswer = answers[scenario.key as keyof typeof answers];
  const isLastScenario = currentScenario === scenarios.length - 1;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [scenario.key]: value });
  };

  const handleNext = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: 'Answer required',
        description: 'Please describe this scenario before continuing.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    await onUpdate({ [scenario.key]: currentAnswer });

    if (isLastScenario) {
      // Generate AI analysis
      setGenerating(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-decision', {
          body: {
            type: 'scenario',
            decisionTitle: decision.title,
            bestCase: answers.best_case_scenario,
            likelyCase: answers.likely_case_scenario,
            worstCase: answers.worst_case_scenario,
          },
        });

        if (error) throw error;

        setAnalysis(data.analysis);
        await onUpdate({
          ...answers,
          ai_scenario_analysis: data.analysis,
        });
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
    } else {
      setCurrentScenario(currentScenario + 1);
    }

    setLoading(false);
  };

  const handlePrevious = () => {
    if (currentScenario > 0) {
      setCurrentScenario(currentScenario - 1);
      setAnalysis('');
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
            <div className="text-sm text-muted-foreground mb-2">
              Step 3 of 5 • Scenario {currentScenario + 1} of {scenarios.length}
            </div>
            <CardTitle className="text-xl">{decision.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysis ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-semibold">Scenario Analysis</h3>
                </div>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-wrap leading-relaxed">{analysis}</p>
                </div>
                <Button onClick={handleContinue} className="w-full gap-2">
                  Continue to Bias Check
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-base font-medium">{scenario.title}</Label>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                </div>

                <Textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={scenario.placeholder}
                  rows={6}
                  className="resize-none"
                />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentScenario === 0 || loading}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={loading || generating}
                    className="flex-1"
                  >
                    {loading || generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isLastScenario ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Scenarios
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
