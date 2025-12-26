import { useNavigate } from 'react-router-dom';
import { Decision } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, CheckCircle2, Sparkles, AlertTriangle, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { FormattedText } from '@/components/FormattedText';

interface DecisionCompleteProps {
  decision: Decision;
}

export const DecisionComplete = ({ decision }: DecisionCompleteProps) => {
  const navigate = useNavigate();

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
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{decision.title}</h1>
            {decision.locked_at && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4" />
                Decided on {format(new Date(decision.locked_at), 'MMMM d, yyyy')}
              </p>
            )}
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Your Decision</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap">{decision.final_decision}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Key Reasons</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap">{decision.key_reasons}</p>
            </CardContent>
          </Card>

          {decision.risks_accepted && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Risks Accepted</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-foreground">
                <p className="whitespace-pre-wrap">{decision.risks_accepted}</p>
              </CardContent>
            </Card>
          )}

          {decision.detected_biases && decision.detected_biases.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Biases Acknowledged
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {decision.detected_biases.map((bias, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-destructive/10 text-destructive"
                    >
                      {bias}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {decision.ai_insight_summary && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormattedText content={decision.ai_insight_summary} />
              </CardContent>
            </Card>
          )}

          {decision.ai_scenario_analysis && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Scenario Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormattedText content={decision.ai_scenario_analysis} />
              </CardContent>
            </Card>
          )}

          {decision.ai_second_order_analysis && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Second-Order Effects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormattedText content={decision.ai_second_order_analysis} />
              </CardContent>
            </Card>
          )}

          {/* Reflection prompt for old decisions */}
          {decision.locked_at && differenceInDays(new Date(), new Date(decision.locked_at)) >= 30 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Time for a reflection</p>
                    <p className="text-sm text-muted-foreground">
                      It's been {differenceInDays(new Date(), new Date(decision.locked_at))} days since you made this decision.
                    </p>
                  </div>
                  <Button onClick={() => navigate(`/reflect/${decision.id}`)}>
                    Reflect
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center pt-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
