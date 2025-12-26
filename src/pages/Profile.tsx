import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, Loader2, User, CreditCard } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';
import { useToast } from '@/hooks/use-toast';

interface BiasProfile {
  id: string;
  user_id: string;
  common_biases: string[] | null;
  risk_tolerance: string | null;
  fear_patterns: string | null;
  overconfidence_patterns: string | null;
  ai_profile_summary: string | null;
  total_decisions_analyzed: number | null;
}

interface Profile {
  email: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  decisions_used_this_month: number | null;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [biasProfile, setBiasProfile] = useState<BiasProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [biasRes, profileRes] = await Promise.all([
        supabase.from('bias_profiles').select('*').eq('user_id', user!.id).single(),
        supabase.from('profiles').select('email, subscription_tier, subscription_status, decisions_used_this_month').eq('user_id', user!.id).single()
      ]);

      if (biasRes.data) {
        setBiasProfile(biasRes.data as BiasProfile);
      }
      if (profileRes.data) {
        setProfile(profileRes.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProfile = async () => {
    setAnalyzing(true);
    try {
      // Fetch all completed decisions for analysis
      const { data: decisions, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'completed');

      if (error) throw error;

      if (!decisions || decisions.length < 2) {
        toast({
          title: 'Not enough data',
          description: 'Complete at least 2 decisions to generate a bias profile.',
        });
        setAnalyzing(false);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('analyze-decision', {
        body: {
          type: 'profile',
          decisions: decisions.map(d => ({
            title: d.title,
            category: d.category,
            detected_biases: d.detected_biases,
            time_horizon: d.time_horizon,
            is_reversible: d.is_reversible,
            biggest_fear: d.biggest_fear,
            future_regret: d.future_regret,
          })),
        },
      });

      if (fnError) throw fnError;

      // Upsert bias profile
      const newProfile = {
        user_id: user!.id,
        common_biases: data.common_biases || [],
        risk_tolerance: data.risk_tolerance,
        fear_patterns: data.fear_patterns,
        overconfidence_patterns: data.overconfidence_patterns,
        ai_profile_summary: data.summary,
        total_decisions_analyzed: decisions.length,
      };

      const { error: upsertError } = await supabase
        .from('bias_profiles')
        .upsert(newProfile, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;

      setBiasProfile({ ...newProfile, id: biasProfile?.id || '' });
      toast({
        title: 'Profile updated',
        description: 'Your bias profile has been analyzed.',
      });
    } catch (error: any) {
      console.error('Error analyzing profile:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
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
            <h1 className="text-2xl font-semibold text-foreground">Profile & Insights</h1>
            <p className="text-muted-foreground">
              Understand your decision-making patterns
            </p>
          </div>

          {/* Account Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">{profile?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan</span>
                <span className="text-foreground capitalize">{profile?.subscription_tier || 'Free'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="text-foreground capitalize">{profile?.subscription_status || 'Inactive'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Decisions this month</span>
                <span className="text-foreground">{profile?.decisions_used_this_month || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Bias Profile */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Bias Profile
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeProfile}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : biasProfile ? (
                    'Refresh'
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>
              <CardDescription>
                Based on {biasProfile?.total_decisions_analyzed || 0} completed decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {biasProfile?.ai_profile_summary ? (
                <>
                  <FormattedText content={biasProfile.ai_profile_summary} />

                  {biasProfile.common_biases && biasProfile.common_biases.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Common Biases
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {biasProfile.common_biases.map((bias, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-destructive/10 text-destructive"
                          >
                            {bias}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {biasProfile.risk_tolerance && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Risk Tolerance
                      </h4>
                      <p className="text-sm text-muted-foreground">{biasProfile.risk_tolerance}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete at least 2 decisions to generate your bias profile.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
