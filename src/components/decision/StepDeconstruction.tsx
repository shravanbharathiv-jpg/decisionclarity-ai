import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Lock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface StepDeconstructionProps {
  decision: Decision;
  onUpdate: (updates: Partial<Decision>) => Promise<boolean>;
  onNext: () => void;
  hasPaid: boolean;
}

const questions = [
  {
    key: 'time_horizon',
    question: 'What is the time horizon for this decision?',
    description: 'How far into the future are you looking?',
    type: 'select',
    options: [
      { value: 'weeks', label: 'Weeks' },
      { value: 'months', label: 'Months' },
      { value: '1-2 years', label: '1-2 years' },
      { value: '5+ years', label: '5+ years' },
    ],
  },
  {
    key: 'is_reversible',
    question: 'Is this decision reversible?',
    description: 'Can you undo or change course if needed?',
    type: 'select',
    options: [
      { value: 'yes', label: 'Yes, easily reversible' },
      { value: 'partially', label: 'Partially reversible' },
      { value: 'no', label: 'No, irreversible' },
    ],
  },
  {
    key: 'do_nothing_outcome',
    question: 'What happens if you do nothing?',
    description: 'Describe the outcome of maintaining the status quo.',
    type: 'text',
  },
  {
    key: 'biggest_fear',
    question: 'What are you most afraid of?',
    description: 'Be honest about your deepest concern.',
    type: 'text',
  },
  {
    key: 'future_regret',
    question: 'What would future-you regret more?',
    description: 'Taking action and it not working out, or not taking action at all?',
    type: 'text',
  },
];

export const StepDeconstruction = ({ decision, onUpdate, onNext, hasPaid }: StepDeconstructionProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    time_horizon: decision.time_horizon || '',
    is_reversible: decision.is_reversible || '',
    do_nothing_outcome: decision.do_nothing_outcome || '',
    biggest_fear: decision.biggest_fear || '',
    future_regret: decision.future_regret || '',
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [insight, setInsight] = useState(decision.ai_insight_summary || '');
  const navigate = useNavigate();
  const { toast } = useToast();

  const question = questions[currentQuestion];
  const currentAnswer = answers[question.key as keyof typeof answers];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const allAnswered = Object.values(answers).every((a) => a.trim() !== '');

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [question.key]: value });
  };

  const handleNext = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: 'Answer required',
        description: 'Please answer the question before continuing.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    // Save current answer
    await onUpdate({ [question.key]: currentAnswer });
    
    if (isLastQuestion) {
      // Generate AI insights
      setGenerating(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-decision', {
          body: {
            type: 'insight',
            decisionTitle: decision.title,
            decisionDescription: decision.description,
            ...answers,
          },
        });

        if (error) throw error;

        setInsight(data.analysis);
        await onUpdate({ 
          ...answers,
          ai_insight_summary: data.analysis,
        });
      } catch (error: any) {
        console.error('Error generating insights:', error);
        // If rate limited or payment required, show paywall
        if (error.message?.includes('402') || error.message?.includes('429')) {
          toast({
            title: 'AI features require payment',
            description: 'Unlock AI insights by completing your purchase.',
          });
        } else {
          toast({
            title: 'Error generating insights',
            description: 'Please try again later.',
            variant: 'destructive',
          });
        }
      } finally {
        setGenerating(false);
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
    
    setLoading(false);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setInsight('');
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
              Step 2 of 5 • Question {currentQuestion + 1} of {questions.length}
            </div>
            <CardTitle className="text-xl">{decision.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {insight ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-semibold">AI Insight Summary</h3>
                </div>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-wrap leading-relaxed">{insight}</p>
                </div>
                <Button onClick={handleContinue} className="w-full gap-2">
                  Continue to Scenario Modeling
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-base font-medium">{question.question}</Label>
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                </div>

                {question.type === 'select' ? (
                  <RadioGroup
                    value={currentAnswer}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                  >
                    {question.options?.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleAnswer(option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Take your time to reflect..."
                    rows={5}
                    className="resize-none"
                  />
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0 || loading}
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
                    ) : isLastQuestion ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Insights
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {isLastQuestion && !hasPaid && (
                  <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" />
                    AI insights require payment to unlock
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
