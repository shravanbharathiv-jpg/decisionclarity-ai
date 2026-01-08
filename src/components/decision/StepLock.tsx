import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Lock, Loader2, Sparkles, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const canLock = finalDecision.trim() && keyReasons.trim();

  useEffect(() => {
    // Auto-fetch recommendation when component mounts if not already fetched
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
      toast({
        title: 'Could not get AI recommendation',
        description: 'You can still proceed with your decision.',
        variant: 'destructive',
      });
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
      biases_acknowledged: decision.detected_biases?.join(', ') || null,
      decision_summary: summary,
      is_locked: true,
      locked_at: new Date().toISOString(),
      status: 'completed',
    });

    if (success) {
      toast({
        title: 'Decision locked',
        description: 'Your decision has been recorded. Time to move forward.',
      });
      navigate(`/decision/${decision.id}`);
    }

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

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* AI Recommendation Card */}
        {showRecommendation && aiRecommendation && (
          <Card className="border-primary/30 bg-primary/5 mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI Recommendation</CardTitle>
              </div>
              <CardDescription>
                Based on your analysis, here's what our AI thinks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <FormattedText content={aiRecommendation} />
              </div>
            </CardContent>
          </Card>
        )}

        {loadingRecommendation && (
          <Card className="border-border/50 mb-6">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Analyzing your decision and generating recommendation...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Step 5 of 5</div>
            <CardTitle className="text-xl">{decision.title}</CardTitle>
            <CardDescription>
              Based on everything you've explored, what is your decision?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick summary of analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Scenarios Analyzed</p>
                <p className="text-sm font-medium">
                  {decision.best_case_scenario ? '✓' : '—'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Biases Detected</p>
                <p className="text-sm font-medium">
                  {decision.detected_biases?.length || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <TrendingUp className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">2nd Order Effects</p>
                <p className="text-sm font-medium">
                  {decision.second_order_effects ? '✓' : '—'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="decision" className="text-base font-medium">
                Your Decision
              </Label>
              <p className="text-xs text-muted-foreground">
                State your decision clearly. Be specific about what you will do.
              </p>
              <Textarea
                id="decision"
                value={finalDecision}
                onChange={(e) => setFinalDecision(e.target.value)}
                placeholder="I have decided to..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasons" className="text-base font-medium">
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
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risks" className="text-base font-medium">
                Risks Accepted <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                What downsides are you consciously accepting?
              </p>
              <Textarea
                id="risks"
                value={risksAccepted}
                onChange={(e) => setRisksAccepted(e.target.value)}
                placeholder="I accept that..."
                rows={3}
                className="resize-none"
              />
            </div>

            {decision.detected_biases && decision.detected_biases.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-amber-600">Biases to be aware of:</p>
                <div className="flex flex-wrap gap-2">
                  {decision.detected_biases.map((bias, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-background border"
                    >
                      {bias}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Acknowledging these doesn't mean you're wrong—just that you're aware.
                </p>
              </div>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full gap-2" disabled={!canLock || loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Lock Decision
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Lock this decision?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Once locked, this decision becomes read-only. This is designed to 
                    help you stop second-guessing and move forward with confidence.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep editing</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLock}>
                    Yes, lock it
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <p className="text-xs text-center text-muted-foreground">
              Locking your decision ends the deliberation. 
              You can always view it later.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
