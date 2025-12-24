import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
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

interface StepLockProps {
  decision: Decision;
  onUpdate: (updates: Partial<Decision>) => Promise<boolean>;
}

export const StepLock = ({ decision, onUpdate }: StepLockProps) => {
  const [finalDecision, setFinalDecision] = useState(decision.final_decision || '');
  const [keyReasons, setKeyReasons] = useState(decision.key_reasons || '');
  const [risksAccepted, setRisksAccepted] = useState(decision.risks_accepted || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const canLock = finalDecision.trim() && keyReasons.trim();

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

    // Generate decision summary
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

      <main className="container mx-auto px-4 py-12 max-w-xl">
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Step 5 of 5</div>
            <CardTitle className="text-xl">{decision.title}</CardTitle>
            <CardDescription>
              Based on everything you've explored, what is your decision?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="decision" className="text-base font-medium">
                Your Decision
              </Label>
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
              <Textarea
                id="reasons"
                value={keyReasons}
                onChange={(e) => setKeyReasons(e.target.value)}
                placeholder="The main reasons for this decision are..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risks" className="text-base font-medium">
                Risks Accepted <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="risks"
                value={risksAccepted}
                onChange={(e) => setRisksAccepted(e.target.value)}
                placeholder="I accept the following risks..."
                rows={3}
                className="resize-none"
              />
            </div>

            {decision.detected_biases && decision.detected_biases.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Biases to be aware of:</p>
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
