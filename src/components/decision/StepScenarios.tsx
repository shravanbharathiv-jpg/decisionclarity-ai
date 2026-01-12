import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, TrendingUp, TrendingDown, Target, CheckCircle2, HelpCircle } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';

interface StepScenariosProps {
  decision: Decision;
  onUpdate: (updates: Partial<Decision>) => Promise<boolean>;
  onNext: () => void;
}

const scenarioSteps = [
  {
    key: 'best_case_scenario',
    title: '🚀 Best Realistic Case',
    subtitle: 'Dream outcome that could actually happen',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    prompts: [
      'Everything goes according to plan...',
      'The stars align and you get...',
      'In the ideal but realistic scenario...'
    ],
  },
  {
    key: 'likely_case_scenario',
    title: '🎯 Most Likely Outcome',
    subtitle: 'What will probably happen',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    prompts: [
      'Based on similar situations...',
      'Realistically speaking...',
      'Given the circumstances...'
    ],
  },
  {
    key: 'worst_case_scenario',
    title: '⚠️ Worst Realistic Case',
    subtitle: 'The downside you need to accept',
    icon: TrendingDown,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    prompts: [
      'If things go wrong...',
      'The worst that could realistically happen...',
      'The downside I need to be okay with...'
    ],
  },
];

export const StepScenarios = ({ decision, onUpdate, onNext }: StepScenariosProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    best_case_scenario: decision.best_case_scenario || '',
    likely_case_scenario: decision.likely_case_scenario || '',
    worst_case_scenario: decision.worst_case_scenario || '',
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analysis, setAnalysis] = useState(decision.ai_scenario_analysis || '');
  const [showSummary, setShowSummary] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const scenario = scenarioSteps[currentStep];
  const currentAnswer = answers[scenario?.key as keyof typeof answers] || '';
  const isLastScenario = currentStep === scenarioSteps.length - 1;
  const progress = ((currentStep + 1) / scenarioSteps.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [scenario.key]: value });
  };

  const usePrompt = (prompt: string) => {
    setAnswers({ ...answers, [scenario.key]: prompt });
  };

  const handleNext = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: 'Please describe this scenario',
        description: 'Take a moment to think through this possibility.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    await onUpdate({ [scenario.key]: currentAnswer });

    if (isLastScenario) {
      setShowSummary(true);
    } else {
      setCurrentStep(currentStep + 1);
    }

    setLoading(false);
  };

  const handlePrevious = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateAnalysis = async () => {
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
  };

  const ScenarioIcon = scenario?.icon || Target;

  if (analysis) {
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
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Step 3 of 5</div>
              <CardTitle className="text-lg sm:text-xl">{decision.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">AI Scenario Analysis</h3>
              </div>
              
              {/* Scenario Summary Cards */}
              <div className="grid gap-2 sm:gap-3">
                {scenarioSteps.map((s, i) => (
                  <div key={s.key} className={`p-2 sm:p-3 rounded-lg ${s.bgColor} flex items-start gap-2 sm:gap-3`}>
                    <div className={`p-1 sm:p-1.5 rounded ${s.color} bg-background flex-shrink-0`}>
                      <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium">{s.title}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                        {answers[s.key as keyof typeof answers]}
                      </p>
                    </div>
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 rounded-lg p-3 sm:p-4 max-h-[35vh] overflow-y-auto">
                <FormattedText content={analysis} />
              </div>
              
              <Button onClick={onNext} className="w-full gap-2">
                Continue to Bias Check
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (showSummary) {
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
              <div className="text-sm text-muted-foreground mb-2">Step 3 of 5 • Review</div>
              <CardTitle className="text-xl">Your Scenario Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scenario Summary */}
              <div className="space-y-4">
                {scenarioSteps.map((s) => (
                  <div key={s.key} className={`p-4 rounded-lg border ${s.bgColor} border-border/50`}>
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                      <span className="font-medium">{s.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {answers[s.key as keyof typeof answers]}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handlePrevious} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handleGenerateAnalysis} disabled={generating} className="flex-1">
                  {generating ? (
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
          <CardHeader className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Step 3 of 5 • Scenario {currentStep + 1} of {scenarioSteps.length}
            </div>
            <Progress value={progress} className="h-2" />
            <CardTitle className="text-xl">{decision.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scenario Header */}
            <div className={`p-4 rounded-lg ${scenario.bgColor} text-center`}>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-background mb-3`}>
                <ScenarioIcon className={`h-6 w-6 ${scenario.color}`} />
              </div>
              <h3 className="text-lg font-semibold">{scenario.title}</h3>
              <p className="text-sm text-muted-foreground">{scenario.subtitle}</p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Need help getting started? Try one of these:
              </p>
              <div className="flex flex-wrap gap-2">
                {scenario.prompts.map((prompt, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => usePrompt(prompt)}
                  >
                    {prompt}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <Textarea
              value={currentAnswer}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={`Describe the ${scenario.title.toLowerCase().replace(/[^a-z\s]/g, '').trim()}...`}
              rows={5}
              className="resize-none"
            />

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0 || loading}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isLastScenario ? 'Review' : 'Next'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
