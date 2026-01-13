import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, Lock, Loader2, Sparkles, CheckCircle, AlertTriangle, 
  TrendingUp, Target, Shield, Zap, Award, Star, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FormattedText } from '@/components/FormattedText';

interface StepLockProps {
  decision: Decision;
  onUpdate: (updates: Partial<Decision>) => Promise<boolean>;
}

export const StepLock = ({ decision, onUpdate }: StepLockProps) => {
  const [finalDecision, setFinalDecision] = useState(decision.final_decision || '');
  const [keyReasons, setKeyReasons] = useState(decision.key_reasons || '');
  const [risksAccepted, setRisksAccepted] = useState(decision.risks_accepted || '');
  const [confidence, setConfidence] = useState(() => {
    // Stored in DB as 1–10 (see decisions_confidence_rating_check)
    const initial = decision.confidence_rating ?? 7;
    return Math.min(10, Math.max(1, Math.round(initial)));
  });
  const [loading, setLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [step, setStep] = useState<'recommendation' | 'form'>('recommendation');
  const navigate = useNavigate();
  const { toast } = useToast();

  const canLock = finalDecision.trim() && keyReasons.trim();

  useEffect(() => {
    if (!aiRecommendation && !loadingRecommendation) {
      fetchRecommendation();
    }
  }, []);

  const fetchRecommendation = async () => {
    setLoadingRecommendation(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-decision', {
        body: {
          type: 'recommendation',
          decisionTitle: decision.title,
          decisionDescription: decision.description,
          bestCase: decision.best_case_scenario,
          likelyCase: decision.likely_case_scenario,
          worstCase: decision.worst_case_scenario,
          detectedBiases: decision.detected_biases,
          secondOrderEffects: decision.second_order_effects,
        },
      });

      if (error) throw error;
      setAiRecommendation(data.analysis);
      setShowRecommendation(true);
    } catch (error: any) {
      console.error('Failed to get recommendation:', error);
      setStep('form');
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleLock = async () => {
    if (!canLock) {
      toast({
        title: 'Incomplete',
        description: 'Please fill in your decision and key reasons.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const normalizedConfidence = Math.min(10, Math.max(1, Math.round(confidence)));

      const summary = `Decision: ${decision.title}\n\n${finalDecision}\n\nKey Reasons:\n${keyReasons}\n\nRisks Accepted:\n${risksAccepted || 'None specified'}\n\nBiases Acknowledged:\n${decision.detected_biases?.join(', ') || 'None detected'}`;

      const success = await onUpdate({
        final_decision: finalDecision,
        key_reasons: keyReasons,
        risks_accepted: risksAccepted,
        confidence_rating: normalizedConfidence,
        biases_acknowledged: decision.detected_biases?.join(', ') || null,
        decision_summary: summary,
        is_locked: true,
        locked_at: new Date().toISOString(),
        status: 'completed',
      });

      if (success) {
        toast({
          title: '🎉 Decision locked!',
          description: 'Your decision has been recorded. Time to move forward with confidence.',
        });
        navigate(`/decision/${decision.id}`);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save your decision. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error locking decision:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Analysis completeness score
  const analysisScore = [
    decision.best_case_scenario,
    decision.likely_case_scenario,
    decision.worst_case_scenario,
    decision.detected_biases?.length,
    decision.second_order_effects,
    decision.ai_insight_summary,
  ].filter(Boolean).length;

  const analysisQuality = analysisScore >= 5 ? 'Excellent' : analysisScore >= 3 ? 'Good' : 'Basic';
  const analysisColor = analysisScore >= 5 ? 'text-green-500' : analysisScore >= 3 ? 'text-amber-500' : 'text-orange-500';

  if (step === 'recommendation' && loadingRecommendation) {
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
        
        <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-xl">
          <Card className="border-border/50">
            <CardContent className="py-10 sm:py-16">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Generating AI Recommendation</h3>
                  <p className="text-muted-foreground">
                    Analyzing all your inputs to provide a balanced recommendation...
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { icon: Target, label: 'Scenarios', done: !!decision.best_case_scenario },
                    { icon: Shield, label: 'Biases', done: !!decision.detected_biases?.length },
                    { icon: TrendingUp, label: 'Effects', done: !!decision.second_order_effects },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                        item.done ? 'bg-green-500/10' : 'bg-muted'
                      }`}>
                        {item.done ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (step === 'recommendation' && aiRecommendation) {
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
        
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
          <div className="mb-4 sm:mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Step 6 of 6</span>
              <span className="font-medium text-primary">AI Recommendation</span>
            </div>
            <Progress value={100} className="h-1.5 sm:h-2" />
          </div>

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background shadow-lg mb-4 sm:mb-6">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">AI Recommendation</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Based on your complete analysis
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
              <div className="bg-background/80 rounded-lg p-3 sm:p-4 border border-border/50 max-h-[40vh] overflow-y-auto">
                <FormattedText content={aiRecommendation} />
              </div>

              {/* Analysis quality badge */}
              <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Award className={`h-4 w-4 sm:h-5 sm:w-5 ${analysisColor}`} />
                  <span className="text-xs sm:text-sm font-medium">Analysis Quality</span>
                </div>
                <Badge variant="outline" className={`${analysisColor} text-xs`}>
                  {analysisQuality} ({analysisScore}/6)
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('form')} 
                  className="flex-1 text-sm h-10 sm:h-11"
                >
                  <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Disagree
                </Button>
                <Button 
                  onClick={() => {
                    setFinalDecision(`Based on the AI analysis and my own reflection, I've decided to ${decision.title.toLowerCase()}`);
                    setStep('form');
                  }} 
                  className="flex-1 text-sm h-10 sm:h-11"
                >
                  <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Agree - Lock Decision
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

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
        <div className="mb-4 sm:mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Final Step</span>
            <span className="font-medium text-primary">Lock Your Decision</span>
          </div>
          <Progress value={100} className="h-1.5 sm:h-2" />
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2 px-3 sm:px-6">
            <Badge className="w-fit mx-auto mb-2 sm:mb-3 bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Decision Time
            </Badge>
            <CardTitle className="text-lg sm:text-xl px-2">{decision.title}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              You've done the analysis. Now it's time to commit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
            {/* Quick summary */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-green-500/10 text-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mx-auto mb-0.5 sm:mb-1" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Scenarios</p>
                <p className="text-xs sm:text-sm font-medium">
                  {decision.best_case_scenario ? '✓' : '—'}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-amber-500/10 text-center">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mx-auto mb-0.5 sm:mb-1" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Biases</p>
                <p className="text-xs sm:text-sm font-medium">
                  {decision.detected_biases?.length || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-blue-500/10 text-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mx-auto mb-0.5 sm:mb-1" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Effects</p>
                <p className="text-xs sm:text-sm font-medium">
                  {decision.second_order_effects ? '✓' : '—'}
                </p>
              </div>
            </div>

            {/* Final decision input */}
            <div className="space-y-2">
              <Label htmlFor="decision" className="text-base font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Your Final Decision
              </Label>
              <p className="text-xs text-muted-foreground">
                State your decision clearly. Be specific about what you will do.
              </p>
              <Textarea
                id="decision"
                value={finalDecision}
                onChange={(e) => setFinalDecision(e.target.value)}
                placeholder="I have decided to..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Key reasons */}
            <div className="space-y-2">
              <Label htmlFor="reasons" className="text-base font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Key Reasons
              </Label>
              <p className="text-xs text-muted-foreground">
                Why are you making this choice? List 2-3 main reasons.
              </p>
              <Textarea
                id="reasons"
                value={keyReasons}
                onChange={(e) => setKeyReasons(e.target.value)}
                placeholder="1. The likely outcome is positive and aligned with my goals&#10;2. The worst case is manageable&#10;3. Waiting would have its own costs"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Risks accepted */}
            <div className="space-y-2">
              <Label htmlFor="risks" className="text-base font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Risks Accepted <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              <Textarea
                id="risks"
                value={risksAccepted}
                onChange={(e) => setRisksAccepted(e.target.value)}
                placeholder="I accept that..."
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Confidence slider */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Confidence Level
              </Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span
                  className={`text-lg font-bold min-w-[60px] text-right ${
                    confidence >= 8 ? 'text-green-500' : confidence >= 5 ? 'text-amber-500' : 'text-red-500'
                  }`}
                >
                  {confidence}/10
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {confidence >= 8
                  ? "High confidence — you've thought this through."
                  : confidence >= 5
                    ? 'Moderate confidence — solid, but consider any remaining unknowns.'
                    : 'Low confidence — consider doing a bit more analysis before locking.'}
              </p>
            </div>

            {/* Biases reminder */}
            {decision.detected_biases && decision.detected_biases.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Biases to remember:
                </p>
                <div className="flex flex-wrap gap-2">
                  {decision.detected_biases.map((bias, index) => (
                    <Badge key={index} variant="outline" className="bg-background">
                      {bias}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  You're aware of these—that's what matters.
                </p>
              </div>
            )}

            {/* Lock button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="w-full gap-2 text-sm sm:text-base h-11 sm:h-12" 
                  size="lg"
                  disabled={!canLock || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Lock Decision Forever</span>
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-lg mx-2 sm:mx-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                    Lock this decision?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    Once locked, this decision becomes permanent. This is designed to 
                    help you stop second-guessing and move forward with confidence.
                    <br /><br />
                    You'll be able to reflect on it later, but not change it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Keep editing</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLock} className="gap-2 w-full sm:w-auto">
                    <Lock className="h-4 w-4" />
                    Yes, lock it
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <p className="text-xs text-center text-muted-foreground">
              Once locked, you can view and reflect on your decision, but not edit it.
              This helps prevent endless deliberation.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
