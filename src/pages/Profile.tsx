import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, Loader2, User, Crown, Zap, Sparkles, Settings, Target, Clock, CheckCircle2, BarChart3, Calendar } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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

interface DecisionStats {
  total: number;
  thisMonth: number;
  completed: number;
  inProgress: number;
  avgConfidence: number;
  categories: Record<string, number>;
}

const Profile = () => {
  const { user, subscriptionTier, hasPaid, isAdmin, checkPaymentStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [biasProfile, setBiasProfile] = useState<BiasProfile | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState<DecisionStats>({
    total: 0,
    thisMonth: 0,
    completed: 0,
    inProgress: 0,
    avgConfidence: 0,
    categories: {},
  });

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
        supabase.from('decisions').select('id, created_at, status, category, confidence_rating').eq('user_id', user!.id)
      ]);

      if (biasRes.data) {
        setBiasProfile(biasRes.data as BiasProfile);
      }
      if (profileRes.data) {
        setProfile(profileRes.data);
      }
      
      // Calculate stats
      if (decisionsRes.data) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthDecisions = decisionsRes.data.filter(d => 
          new Date(d.created_at) >= startOfMonth
        ).length;
        
        const completed = decisionsRes.data.filter(d => d.status === 'completed').length;
        const inProgress = decisionsRes.data.filter(d => d.status !== 'completed').length;
        
        // Calculate average confidence
        const ratings = decisionsRes.data
          .filter(d => d.confidence_rating != null)
          .map(d => d.confidence_rating as number);
        const avgConfidence = ratings.length > 0 
          ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10)
          : 0;
        
        // Calculate category distribution
        const categories: Record<string, number> = {};
        decisionsRes.data.forEach(d => {
          const cat = d.category || 'Uncategorized';
          categories[cat] = (categories[cat] || 0) + 1;
        });

        setStats({
          total: decisionsRes.data.length,
          thisMonth: thisMonthDecisions,
          completed,
          inProgress,
          avgConfidence,
          categories,
        });
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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">Back to dashboard</span>
            <span className="xs:hidden">Back</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-3xl">
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Profile & Insights</h1>
            <p className="text-sm text-muted-foreground">
              Understand your decision-making patterns
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total Decisions</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.completed}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.inProgress}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.avgConfidence}%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Confidence</p>
              </CardContent>
            </Card>
          </div>

          {/* Account Info */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
              <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 xs:gap-0">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm text-foreground truncate">{profile?.email || user?.email}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plan</span>
                <div className="flex items-center gap-2">
                  <PlanIcon className={`h-4 w-4 ${plan.color}`} />
                  <span className="text-sm text-foreground font-medium">{plan.name}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={`${status.color} text-xs`}>{status.text}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Decisions this month</span>
                <span className="text-sm text-foreground">
                  {stats.thisMonth}
                  {!hasPaid && <span className="text-muted-foreground"> / 3</span>}
                </span>
              </div>

              {profile?.subscription_end_date && subscriptionTier === 'premium' && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Renews on</span>
                  <span className="text-sm text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(profile.subscription_end_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}

              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2">
                {!hasPaid ? (
                  <Button onClick={() => navigate('/pricing')} className="flex-1 h-10 sm:h-11 text-sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                ) : subscriptionTier !== 'lifetime' && !isAdmin ? (
                  <Button variant="outline" onClick={handleManageSubscription} className="flex-1 h-10 sm:h-11 text-sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          {Object.keys(stats.categories).length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  Decision Categories
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Distribution of your decisions by category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-3 sm:px-6">
                {Object.entries(stats.categories)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([category, count]) => {
                    const percentage = Math.round((count / stats.total) * 100);
                    return (
                      <div key={category} className="space-y-1.5">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-foreground capitalize">{category}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-1.5 sm:h-2" />
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          )}

          {/* Bias Profile */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
                  Bias Profile
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeProfile}
                  disabled={analyzing || !hasPaid}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1.5" />
                      <span className="hidden xs:inline">Analyzing...</span>
                      <span className="xs:hidden">...</span>
                    </>
                  ) : biasProfile ? (
                    'Refresh'
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Based on {biasProfile?.total_decisions_analyzed || 0} completed decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
              {!hasPaid ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <Brain className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm mb-3 sm:mb-4">Upgrade to Pro to unlock your personalized bias profile.</p>
                  <Button onClick={() => navigate('/pricing')} variant="outline" className="h-9 sm:h-10 text-sm">
                    View Plans
                  </Button>
                </div>
              ) : biasProfile?.ai_profile_summary ? (
                <>
                  <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                    <FormattedText content={biasProfile.ai_profile_summary} />
                  </div>

                  {biasProfile.common_biases && biasProfile.common_biases.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs sm:text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Common Biases
                      </h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {biasProfile.common_biases.map((bias, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm bg-destructive/10 text-destructive"
                          >
                            {bias}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {biasProfile.risk_tolerance && (
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Risk Tolerance
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{biasProfile.risk_tolerance}</p>
                    </div>
                  )}

                  {biasProfile.fear_patterns && (
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Fear Patterns
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{biasProfile.fear_patterns}</p>
                    </div>
                  )}

                  {biasProfile.overconfidence_patterns && (
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Overconfidence Patterns
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{biasProfile.overconfidence_patterns}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <Brain className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm">Complete at least 2 decisions to generate your bias profile.</p>
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
