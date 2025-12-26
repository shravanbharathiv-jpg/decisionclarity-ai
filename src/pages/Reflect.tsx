import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Clock, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';

interface Decision {
  id: string;
  title: string;
  final_decision: string | null;
  locked_at: string | null;
  category: string | null;
}

interface Reflection {
  id: string;
  decision_id: string;
  reflection_type: string;
  aged_well: boolean | null;
  what_surprised: string | null;
  what_differently: string | null;
  ai_reflection_analysis: string | null;
  created_at: string;
}

const Reflect = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [existingReflection, setExistingReflection] = useState<Reflection | null>(null);
  const [agedWell, setAgedWell] = useState<string>('');
  const [whatSurprised, setWhatSurprised] = useState('');
  const [whatDifferently, setWhatDifferently] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (id) {
      fetchData();
    }
  }, [user, id, navigate]);

  const fetchData = async () => {
    try {
      const [decisionRes, reflectionRes] = await Promise.all([
        supabase.from('decisions').select('id, title, final_decision, locked_at, category').eq('id', id!).single(),
        supabase.from('decision_reflections').select('*').eq('decision_id', id!).eq('user_id', user!.id).order('created_at', { ascending: false }).limit(1)
      ]);

      if (decisionRes.error) throw decisionRes.error;
      setDecision(decisionRes.data);

      if (reflectionRes.data && reflectionRes.data.length > 0) {
        const reflection = reflectionRes.data[0] as Reflection;
        setExistingReflection(reflection);
        setAgedWell(reflection.aged_well ? 'yes' : reflection.aged_well === false ? 'no' : '');
        setWhatSurprised(reflection.what_surprised || '');
        setWhatDifferently(reflection.what_differently || '');
        setAnalysis(reflection.ai_reflection_analysis);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load decision.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getReflectionType = () => {
    if (!decision?.locked_at) return '30-day';
    const days = differenceInDays(new Date(), new Date(decision.locked_at));
    if (days >= 180) return '180-day';
    if (days >= 90) return '90-day';
    return '30-day';
  };

  const handleSubmit = async () => {
    if (!agedWell) {
      toast({
        title: 'Required',
        description: 'Please indicate whether the decision aged well.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Get AI analysis
      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-reflection', {
        body: {
          decisionTitle: decision!.title,
          finalDecision: decision!.final_decision,
          agedWell: agedWell === 'yes',
          whatSurprised,
          whatDifferently,
          reflectionType: getReflectionType(),
        },
      });

      if (aiError) throw aiError;

      const reflectionData = {
        user_id: user!.id,
        decision_id: decision!.id,
        reflection_type: getReflectionType(),
        aged_well: agedWell === 'yes',
        what_surprised: whatSurprised || null,
        what_differently: whatDifferently || null,
        ai_reflection_analysis: aiData.analysis,
      };

      const { error } = await supabase.from('decision_reflections').insert(reflectionData);
      if (error) throw error;

      setAnalysis(aiData.analysis);
      toast({
        title: 'Reflection saved',
        description: 'Your reflection has been recorded.',
      });
    } catch (error: any) {
      console.error('Error saving reflection:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save reflection.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!decision) {
    return null;
  }

  const daysSinceLocked = decision.locked_at
    ? differenceInDays(new Date(), new Date(decision.locked_at))
    : 0;

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
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Reflect</h1>
            <p className="text-muted-foreground">{decision.title}</p>
            {decision.locked_at && (
              <p className="text-sm text-muted-foreground">
                Decided {daysSinceLocked} days ago
              </p>
            )}
          </div>

          {analysis ? (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Reflection Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      agedWell === 'yes' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {agedWell === 'yes' ? 'Aged Well' : 'Did Not Age Well'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {getReflectionType()} reflection
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Reflection Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormattedText content={analysis} />
                </CardContent>
              </Card>

              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{getReflectionType()} Reflection</CardTitle>
                <CardDescription>
                  Looking back at your decision to help you learn and grow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Has this decision aged well?
                  </Label>
                  <RadioGroup value={agedWell} onValueChange={setAgedWell}>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes" className="cursor-pointer flex-1">
                        Yes, I'm satisfied with this decision
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no" className="cursor-pointer flex-1">
                        No, I would decide differently
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surprised">What surprised you? (optional)</Label>
                  <Textarea
                    id="surprised"
                    value={whatSurprised}
                    onChange={(e) => setWhatSurprised(e.target.value)}
                    placeholder="Any unexpected outcomes or realizations..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="differently">What would you do differently? (optional)</Label>
                  <Textarea
                    id="differently"
                    value={whatDifferently}
                    onChange={(e) => setWhatDifferently(e.target.value)}
                    placeholder="Any changes you'd make with hindsight..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !agedWell}
                  className="w-full gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Submit Reflection
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reflect;
