import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';

const AiPredictions = () => {
  const { user, hasPaid } = useAuth();
  const [prediction, setPrediction] = useState<string | null>(() => {
    try { return sessionStorage.getItem('clarity_prediction'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const generatePrediction = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: decisions } = await supabase
        .from('decisions')
        .select('title, category, is_locked, confidence_rating, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!decisions || decisions.length < 2) {
        setPrediction("Make at least 2 decisions to get AI predictions about your decision-making patterns.");
        return;
      }

      const { data, error } = await supabase.functions.invoke('clair-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Based on these recent decisions, give me 3 brief, specific predictions about my decision-making patterns and what I might face next. Be concise and insightful. Decisions: ${JSON.stringify(decisions.map(d => ({ title: d.title, category: d.category, completed: d.is_locked, confidence: d.confidence_rating })))}`
          }]
        }
      });

      if (error) throw error;
      const result = data.message || "Couldn't generate predictions right now.";
      setPrediction(result);
      try { sessionStorage.setItem('clarity_prediction', result); } catch {}
    } catch (e) {
      setPrediction("Couldn't generate predictions. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI Predictions
          </CardTitle>
          {!hasPaid && <Badge variant="outline" className="text-[10px]">Pro</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {prediction ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground leading-relaxed">
              <FormattedText content={prediction} />
            </div>
            <Button variant="ghost" size="sm" onClick={generatePrediction} disabled={loading || !hasPaid}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
              Refresh
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Sparkles className="h-8 w-8 text-primary/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Get AI-powered insights about your decision patterns</p>
            <Button size="sm" onClick={generatePrediction} disabled={loading || !hasPaid}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
              Generate Predictions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiPredictions;
