import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, GitCompare, Loader2, Sparkles } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Decision {
  id: string;
  title: string;
  category: string | null;
  status: string;
  created_at: string;
  final_decision: string | null;
}

const Compare = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDecisions();
  }, [user, navigate]);

  const fetchDecisions = async () => {
    try {
      const { data, error } = await supabase
        .from('decisions')
        .select('id, title, category, status, created_at, final_decision')
        .eq('user_id', user!.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDecisions(data || []);
    } catch (error) {
      console.error('Error fetching decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    } else {
      toast({
        title: 'Maximum 4 decisions',
        description: 'You can compare up to 4 decisions at once.',
      });
    }
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      toast({
        title: 'Select at least 2 decisions',
        description: 'Choose 2-4 decisions to compare.',
        variant: 'destructive',
      });
      return;
    }

    setComparing(true);
    try {
      const selectedDecisions = decisions.filter(d => selectedIds.includes(d.id));

      const { data, error } = await supabase.functions.invoke('analyze-decision', {
        body: {
          type: 'compare',
          decisions: selectedDecisions.map(d => ({
            title: d.title,
            category: d.category,
            final_decision: d.final_decision,
          })),
        },
      });

      if (error) throw error;

      setComparisonResult(data.analysis);

      // Save comparison
      const compTitle = title || `Comparison: ${selectedDecisions.map(d => d.title).join(' vs ')}`;
      await supabase.from('decision_comparisons').insert({
        user_id: user!.id,
        title: compTitle.substring(0, 255),
        decision_ids: selectedIds,
        ai_comparison_analysis: data.analysis,
      });

      toast({
        title: 'Comparison complete',
        description: 'Your comparison has been saved.',
      });
    } catch (error: any) {
      console.error('Error comparing:', error);
      toast({
        title: 'Comparison failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setComparing(false);
    }
  };

  const resetComparison = () => {
    setSelectedIds([]);
    setComparisonResult(null);
    setTitle('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Compare Decisions</h1>
            <p className="text-muted-foreground">
              Select 2-4 completed decisions to compare
            </p>
          </div>

          {comparisonResult ? (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Comparison Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormattedText content={comparisonResult} />
                </CardContent>
              </Card>

              <Button onClick={resetComparison} variant="outline" className="w-full">
                Compare Other Decisions
              </Button>
            </div>
          ) : (
            <>
              {decisions.length < 2 ? (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <GitCompare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      Complete at least 2 decisions to use the comparison feature.
                    </p>
                    <Button onClick={() => navigate('/decision/new')} className="mt-4">
                      Start a New Decision
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Select Decisions</CardTitle>
                      <CardDescription>
                        {selectedIds.length} of 4 selected
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {decisions.map(decision => (
                        <div
                          key={decision.id}
                          onClick={() => toggleSelection(decision.id)}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedIds.includes(decision.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <Checkbox
                            checked={selectedIds.includes(decision.id)}
                            onCheckedChange={() => toggleSelection(decision.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{decision.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {decision.category && `${decision.category} • `}
                              {format(new Date(decision.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {selectedIds.length >= 2 && (
                    <Card className="border-border/50">
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Comparison Title (optional)</Label>
                          <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Career vs Location decisions"
                          />
                        </div>
                        <Button
                          onClick={handleCompare}
                          disabled={comparing}
                          className="w-full gap-2"
                        >
                          {comparing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Compare Decisions
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Compare;
