import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, Loader2, User, Crown, Zap, Sparkles, Settings } from 'lucide-react';
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

interface ProfileData {
  email: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_end_date: string | null;
  decisions_used_this_month: number | null;
  stripe_payment_status: string | null;
}

const Profile = () => {
  const { user, subscriptionTier, hasPaid, isAdmin, checkPaymentStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [biasProfile, setBiasProfile] = useState<BiasProfile | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [decisionsThisMonth, setDecisionsThisMonth] = useState(0);
  const [totalDecisions, setTotalDecisions] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [biasRes, profileRes, decisionsRes] = await Promise.all([
        supabase.from('bias_profiles').select('*').eq('user_id', user!.id).single(),
        supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
        supabase.from('decisions').select('id, created_at, status').eq('user_id', user!.id)
      ]);

      if (biasRes.data) {
        setBiasProfile(biasRes.data as BiasProfile);
      }
      if (profileRes.data) {
        setProfile(profileRes.data);
      }
      
      // Calculate decisions this month
      if (decisionsRes.data) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthDecisions = decisionsRes.data.filter(d => 
          new Date(d.created_at) >= startOfMonth
        ).length;
        setDecisionsThisMonth(thisMonthDecisions);
        setTotalDecisions(decisionsRes.data.length);
      }

      // Also refresh payment status from Stripe
      await checkPaymentStatus();
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProfile = async () => {
    setAnalyzing(true);
    try {
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

  const getPlanDisplay = () => {
    if (isAdmin) return { name: 'Admin (Lifetime)', icon: Crown, color: 'text-yellow-500' };
    if (subscriptionTier === 'lifetime') return { name: 'Lifetime', icon: Crown, color: 'text-yellow-500' };
    if (subscriptionTier === 'premium' || hasPaid) return { name: 'Pro', icon: Sparkles, color: 'text-primary' };
    return { name: 'Free', icon: Zap, color: 'text-muted-foreground' };
  };

  const getStatusDisplay = () => {
    if (isAdmin) return { text: 'Active (Admin)', color: 'bg-green-500/10 text-green-600' };
    if (subscriptionTier === 'lifetime') return { text: 'Lifetime Access', color: 'bg-yellow-500/10 text-yellow-600' };
    if (hasPaid) return { text: 'Active', color: 'bg-green-500/10 text-green-600' };
    return { text: 'Free Plan', color: 'bg-muted text-muted-foreground' };
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to open subscription management',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const plan = getPlanDisplay();
  const status = getStatusDisplay();
  const PlanIcon = plan.icon;

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
                <span className="text-foreground">{profile?.email || user?.email}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan</span>
                <div className="flex items-center gap-2">
                  <PlanIcon className={`h-4 w-4 ${plan.color}`} />
                  <span className="text-foreground font-medium">{plan.name}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge className={status.color}>{status.text}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Decisions this month</span>
                <span className="text-foreground">
                  {decisionsThisMonth}
                  {!hasPaid && <span className="text-muted-foreground"> / 3</span>}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total decisions</span>
                <span className="text-foreground">{totalDecisions}</span>
              </div>

              {profile?.subscription_end_date && subscriptionTier === 'premium' && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Renews on</span>
                  <span className="text-foreground">
                    {new Date(profile.subscription_end_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="pt-4 flex gap-2">
                {!hasPaid ? (
                  <Button onClick={() => navigate('/pricing')} className="flex-1">
                    Upgrade to Pro
                  </Button>
                ) : subscriptionTier !== 'lifetime' && !isAdmin ? (
                  <Button variant="outline" onClick={handleManageSubscription} className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                ) : null}
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
                  disabled={analyzing || !hasPaid}
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
              {!hasPaid ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upgrade to Pro to unlock your personalized bias profile.</p>
                  <Button onClick={() => navigate('/pricing')} variant="outline" className="mt-4">
                    View Plans
                  </Button>
                </div>
              ) : biasProfile?.ai_profile_summary ? (
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
