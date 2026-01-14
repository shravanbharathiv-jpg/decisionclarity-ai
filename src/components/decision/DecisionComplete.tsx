import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Decision } from '@/types/decision';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, CheckCircle2, Sparkles, AlertTriangle, Clock, Share2, BarChart3, Loader2, TrendingUp, Brain, Shield, Target } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { FormattedText } from '@/components/FormattedText';
import { SummarizeButton } from '@/components/SummarizeButton';
import { useToast } from '@/hooks/use-toast';

interface DecisionScore {
  overall_score: number;
  clarity_score: number;
  bias_score: number;
  reversibility_score: number;
  analysis_depth_score: number;
  explanation: string;
}

interface DecisionCompleteProps {
  decision: Decision;
}

export const DecisionComplete = ({ decision }: DecisionCompleteProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scores, setScores] = useState<DecisionScore | null>(null);
  const [loadingScores, setLoadingScores] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [displayedInsight, setDisplayedInsight] = useState(decision.ai_insight_summary || '');
  const [displayedScoreExplanation, setDisplayedScoreExplanation] = useState('');

  useEffect(() => {
    fetchOrGenerateScores();
  }, [decision.id]);

  const fetchOrGenerateScores = async () => {
    try {
      // First check if scores exist in DB
      const { data: existingScores } = await supabase
        .from('decision_scores')
        .select('*')
        .eq('decision_id', decision.id)
        .single();

      if (existingScores) {
        const scoreData = {
          overall_score: existingScores.overall_score || 0,
          clarity_score: existingScores.clarity_score || 0,
          bias_score: existingScores.bias_score || 0,
          reversibility_score: existingScores.reversibility_score || 0,
          analysis_depth_score: existingScores.analysis_depth_score || 0,
          explanation: existingScores.ai_score_explanation || '',
        };
        setScores(scoreData);
        setDisplayedScoreExplanation(scoreData.explanation);
        setLoadingScores(false);
        return;
      }

      // Generate new scores
      const { data, error } = await supabase.functions.invoke('score-decision', {
        body: { decision },
      });

      if (error) throw error;

      setScores(data);
      setDisplayedScoreExplanation(data.explanation || '');

      // Save to database
      await supabase.from('decision_scores').insert({
        decision_id: decision.id,
        overall_score: data.overall_score,
        clarity_score: data.clarity_score,
        bias_score: data.bias_score,
        reversibility_score: data.reversibility_score,
        analysis_depth_score: data.analysis_depth_score,
        ai_score_explanation: data.explanation,
      });
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoadingScores(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const ScoreCard = ({ icon: Icon, label, score, description }: { 
    icon: React.ElementType; 
    label: string; 
    score: number; 
    description: string;
  }) => {
    return (
      <div className="p-3 sm:p-4 rounded-lg bg-muted/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium">{label}</span>
          </div>
          <span className={`text-base sm:text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
        <Progress value={score} className="h-1.5 sm:h-2" />
        <p className="text-[10px] sm:text-xs text-muted-foreground">{description}</p>
      </div>
    );
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

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-3xl">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-3 sm:mb-4">
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground px-2">{decision.title}</h1>
            {decision.locked_at && (
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Decided on {format(new Date(decision.locked_at), 'MMMM d, yyyy')}
              </p>
            )}
          </div>

          {/* Decision Score */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Decision Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingScores ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Analyzing decision quality...</span>
                </div>
              ) : scores ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center p-6 rounded-xl bg-background border">
                    <div className={`text-5xl font-bold ${getScoreColor(scores.overall_score)}`}>
                      {scores.overall_score}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
                    <Badge className="mt-2" variant="secondary">
                      {getScoreLabel(scores.overall_score)}
                    </Badge>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <ScoreCard
                      icon={Target}
                      label="Clarity"
                      score={scores.clarity_score}
                      description="How well-defined your decision is"
                    />
                    <ScoreCard
                      icon={Brain}
                      label="Bias Awareness"
                      score={scores.bias_score}
                      description="Recognition of cognitive biases"
                    />
                    <ScoreCard
                      icon={Shield}
                      label="Risk Assessment"
                      score={scores.reversibility_score}
                      description="Understanding of reversibility"
                    />
                    <ScoreCard
                      icon={TrendingUp}
                      label="Analysis Depth"
                      score={scores.analysis_depth_score}
                      description="Thoroughness of your analysis"
                    />
                  </div>

                  {/* AI Explanation */}
                  {scores.explanation && (
                    <div className="space-y-2">
                      <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        <p className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                          {displayedScoreExplanation}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <SummarizeButton 
                          content={scores.explanation} 
                          onSummaryGenerated={(summary) => setDisplayedScoreExplanation(summary)} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Unable to generate scores. Please try again later.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Your Decision */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Your Decision</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap">{decision.final_decision}</p>
            </CardContent>
          </Card>

          {/* Key Reasons */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Key Reasons</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap">{decision.key_reasons}</p>
            </CardContent>
          </Card>

          {/* Risks Accepted */}
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

          {/* Biases */}
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

          {/* AI Insights - Collapsible */}
          {decision.ai_insight_summary && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormattedText content={displayedInsight} />
                <div className="flex justify-end">
                  <SummarizeButton 
                    content={decision.ai_insight_summary} 
                    onSummaryGenerated={(summary) => setDisplayedInsight(summary)} 
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reflection Prompt */}
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
