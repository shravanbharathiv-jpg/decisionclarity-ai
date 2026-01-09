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
  const [confidence, setConfidence] = useState(decision.confidence_rating || 70);
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

    const summary = `Decision: ${decision.title}\n\n${finalDecision}\n\nKey Reasons:\n${keyReasons}\n\nRisks Accepted:\n${risksAccepted || 'None specified'}\n\nBiases Acknowledged:\n${decision.detected_biases?.join(', ') || 'None detected'}`;

    const success = await onUpdate({
      final_decision: finalDecision,
      key_reasons: keyReasons,
      risks_accepted: risksAccepted,
      confidence_rating: confidence,
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
    }

    setLoading(false);
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
        
        <main className="container mx-auto px-4 py-12 max-w-xl">
          <Card className="border-border/50">
            <CardContent className="py-16">
              <div className="text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto">
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
        
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Step 6 of 6</span>
              <span className="font-medium text-primary">AI Recommendation</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background shadow-lg mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Recommendation</CardTitle>
                  <CardDescription>
                    Based on your complete analysis
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background/80 rounded-lg p-4 border border-border/50">
                <FormattedText content={aiRecommendation} />
              </div>

              {/* Analysis quality badge */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Award className={`h-5 w-5 ${analysisColor}`} />
                  <span className="text-sm font-medium">Analysis Quality</span>
                </div>
                <Badge variant="outline" className={analysisColor}>
                  {analysisQuality} ({analysisScore}/6 factors)
                </Badge>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('form')} 
                  className="flex-1"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Disagree - Decide Differently
                </Button>
                <Button 
                  onClick={() => {
                    // Pre-fill based on recommendation
                    setFinalDecision(`Based on the AI analysis and my own reflection, I've decided to ${decision.title.toLowerCase()}`);
                    setStep('form');
                  }} 
                  className="flex-1"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Final Step</span>
            <span className="font-medium text-primary">Lock Your Decision</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <Badge className="w-fit mx-auto mb-3 bg-amber-500/10 text-amber-600 border-amber-500/20">
              <Lock className="h-3 w-3 mr-1" />
              Decision Time
            </Badge>
            <CardTitle className="text-xl">{decision.title}</CardTitle>
            <CardDescription>
              You've done the analysis. Now it's time to commit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-green-500/10 text-center">
                <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Scenarios</p>
                <p className="text-sm font-medium">
                  {decision.best_case_scenario ? '✓ Done' : '—'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Biases</p>
                <p className="text-sm font-medium">
                  {decision.detected_biases?.length || 0} found
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                <TrendingUp className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Effects</p>
                <p className="text-sm font-medium">
                  {decision.second_order_effects ? '✓ Done' : '—'}
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
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className={`text-lg font-bold min-w-[60px] text-right ${
                  confidence >= 70 ? 'text-green-500' : confidence >= 40 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {confidence}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {confidence >= 80 ? 'Very confident - you\'ve thought this through!' :
                 confidence >= 60 ? 'Reasonably confident - a solid decision.' :
                 confidence >= 40 ? 'Somewhat uncertain - consider if more analysis would help.' :
                 'Low confidence - is there more you need to explore?'}
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
                  className="w-full gap-2" 
                  size="lg"
                  disabled={!canLock || loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Lock Decision Forever
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Lock this decision?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Once locked, this decision becomes permanent. This is designed to 
                    help you stop second-guessing and move forward with confidence.
                    <br /><br />
                    You'll be able to reflect on it later, but not change it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep editing</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLock} className="gap-2">
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
