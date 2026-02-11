import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Lock, Lightbulb, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormattedText } from '@/components/FormattedText';

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
    subtitle: "Let's set the stage 🎯",
    tip: '💡 Longer time horizons often favor bolder choices, while shorter ones need more certainty.',
    type: 'select',
    icon: '⏰',
    options: [
      { value: 'weeks', label: 'Weeks', emoji: '📅' },
      { value: 'months', label: 'Months', emoji: '📆' },
      { value: '1-2 years', label: '1-2 years', emoji: '🗓️' },
      { value: '5+ years', label: '5+ years', emoji: '🎯' },
    ],
  },
  {
    key: 'is_reversible',
    question: 'Is this decision reversible?',
    description: 'Can you undo or change course if needed?',
    subtitle: "Understanding your safety net 🔄",
    tip: '💡 Reversible decisions deserve faster action. Irreversible ones merit deeper analysis.',
    type: 'select',
    icon: '🔄',
    options: [
      { value: 'yes', label: 'Yes, easily reversible', emoji: '✅' },
      { value: 'partially', label: 'Partially reversible', emoji: '⚠️' },
      { value: 'no', label: 'No, irreversible', emoji: '🔒' },
    ],
  },
  {
    key: 'do_nothing_outcome',
    question: 'What happens if you do nothing?',
    description: 'Describe the outcome of maintaining the status quo.',
    subtitle: "The hidden choice most people ignore 🤔",
    tip: '💡 "Doing nothing" is also a choice with its own consequences. Make it conscious.',
    type: 'text',
    icon: '🤷',
    placeholder: 'If I take no action, the result would be...',
  },
  {
    key: 'biggest_fear',
    question: 'What are you most afraid of?',
    description: 'Be honest about your deepest concern.',
    subtitle: "Courage starts with honesty 💪",
    tip: '💡 Naming your fears reduces their power. What you can name, you can address.',
    type: 'text',
    icon: '😰',
    placeholder: 'My biggest worry about this decision is...',
  },
  {
    key: 'future_regret',
    question: 'What would future-you regret more?',
    description: 'Taking action and it not working out, or not taking action at all?',
    subtitle: "Almost there — the final piece 🔮",
    tip: '💡 Research shows we regret inaction more than action. What would 80-year-old you say?',
    type: 'text',
    icon: '🔮',
    placeholder: 'Looking back, I would regret more if I...',
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
  const [showTip, setShowTip] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const question = questions[currentQuestion];
  const currentAnswer = answers[question.key as keyof typeof answers];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Count completed answers
  const completedCount = Object.values(answers).filter(a => a.trim() !== '').length;

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
      setShowTip(true);
    }
    
    setLoading(false);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setInsight('');
      setShowTip(true);
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

      <main className="container mx-auto px-4 py-8 max-w-xl">
        {/* Progress Header */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Step 2: Deconstruction</span>
            <span className="font-medium">{completedCount}/{questions.length} answered</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-center gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => i < currentQuestion && setCurrentQuestion(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentQuestion 
                    ? 'bg-primary w-6' 
                    : i < currentQuestion 
                      ? 'bg-primary/50 cursor-pointer hover:bg-primary/70' 
                      : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <Badge variant="secondary" className="w-fit mx-auto mb-3">
              {question.icon} Question {currentQuestion + 1}
            </Badge>
            <p className="text-sm text-primary font-medium">{question.subtitle}</p>
            <CardTitle className="text-lg mt-1">{decision.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {insight ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-semibold">AI Insight Summary</h3>
                </div>
                
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <FormattedText content={insight} />
                </div>

                {/* Progress summary */}
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, i) => (
                    <div key={i} className="text-center">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{q.icon}</span>
                    </div>
                  ))}
                </div>

                <Button onClick={handleContinue} className="w-full gap-2" size="lg">
                  Continue to Scenario Modeling
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                {/* Question */}
                <div className="space-y-2 text-center">
                  <Label className="text-lg font-semibold block">{question.question}</Label>
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                </div>

                {/* Tip */}
                {showTip && (
                  <div 
                    className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2 animate-in slide-in-from-top duration-300 cursor-pointer"
                    onClick={() => setShowTip(false)}
                  >
                    <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-amber-700 dark:text-amber-300">{question.tip}</p>
                      <p className="text-xs text-muted-foreground mt-1">Tap to dismiss</p>
                    </div>
                  </div>
                )}

                {/* Answer Input */}
                {question.type === 'select' ? (
                  <RadioGroup
                    value={currentAnswer}
                    onValueChange={handleAnswer}
                    className="space-y-2"
                  >
                    {question.options?.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${
                          currentAnswer === option.value 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        onClick={() => handleAnswer(option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1 flex items-center gap-2">
                          <span className="text-lg">{option.emoji}</span>
                          <span>{option.label}</span>
                        </Label>
                        {currentAnswer === option.value && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder={question.placeholder || 'Take your time to reflect...'}
                      rows={5}
                      className="resize-none text-base"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{currentAnswer.length > 0 ? `${currentAnswer.length} characters` : 'Start typing...'}</span>
                      <span>
                        {currentAnswer.length >= 50 ? '✓ Good detail' : 'Add more detail for better insights'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 pt-2">
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
                    disabled={loading || generating || !currentAnswer.trim()}
                    className="flex-1"
                  >
                    {loading || generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {generating ? 'Analyzing...' : 'Saving...'}
                      </>
                    ) : isLastQuestion ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Insights
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
                  <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1 pt-2">
                    <Lock className="h-3 w-3" />
                    AI insights require Pro plan
                  </p>
                )}

                {/* Keyboard hint */}
                <p className="text-xs text-center text-muted-foreground">
                  Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to continue
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
