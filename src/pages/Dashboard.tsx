import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, LogOut, Calendar, CheckCircle, Clock, Loader2, GitCompare, Brain, Shield, Menu, Zap, Sparkles, TrendingUp, Crown, Target, BarChart3 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { DECISION_CATEGORIES } from '@/types/decision';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DecisionStreaks from '@/components/dashboard/DecisionStreaks';
import MoodCheckIn from '@/components/dashboard/MoodCheckIn';
import DecisionTimeline from '@/components/dashboard/DecisionTimeline';
import AiPredictions from '@/components/dashboard/AiPredictions';
import SmartTemplates from '@/components/dashboard/SmartTemplates';

interface Decision {
  id: string;
  title: string;
  status: string;
  category: string;
  created_at: string;
  is_locked: boolean;
  locked_at: string | null;
  confidence_rating: number | null;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut, hasPaid, subscriptionTier, isAdmin, checkPaymentStatus } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      toast({
        title: 'Subscription activated!',
        description: 'Welcome to Clarity Pro. Enjoy unlimited decisions and advanced features.',
      });
      checkPaymentStatus();
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchDecisions = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('decisions')
        .select('id, title, status, category, created_at, is_locked, locked_at, confidence_rating')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) console.error('Error fetching decisions:', error);
      else setDecisions(data || []);
      setLoading(false);
    };
    if (user) fetchDecisions();
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/');
  };

  const filteredDecisions = filter === 'all' ? decisions : decisions.filter(d => d.category === filter);
  const completedDecisions = decisions.filter(d => d.is_locked);
  const inProgressDecisions = decisions.filter(d => !d.is_locked);
  const pendingReflections = completedDecisions.filter(d => {
    if (!d.locked_at) return false;
    return differenceInDays(new Date(), new Date(d.locked_at)) >= 30;
  });

  const getCategoryLabel = (value: string) => DECISION_CATEGORIES.find(c => c.value === value)?.label || value;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Clarity</h1>
            {hasPaid && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs h-5">
                {subscriptionTier === 'lifetime' ? 'Lifetime' : 'Pro'}
              </Badge>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                <Shield className="h-4 w-4 mr-1.5" />Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <Brain className="h-4 w-4 mr-1.5" />Insights
            </Button>
            {!hasPaid && (
              <Button variant="default" size="sm" onClick={() => navigate('/pricing')} className="gap-1.5">
                <Crown className="h-3.5 w-3.5" />Upgrade
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-1.5">
            {!hasPaid && (
              <Button size="sm" onClick={() => navigate('/pricing')} className="gap-1 h-8 text-xs px-2.5">
                <Crown className="h-3 w-3" />Pro
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Menu className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAdmin && <DropdownMenuItem onClick={() => navigate('/admin')}><Shield className="h-4 w-4 mr-2" />Admin</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => navigate('/profile')}><Brain className="h-4 w-4 mr-2" />Insights</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/pricing')}><Crown className="h-4 w-4 mr-2" />Plans & Pricing</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} disabled={signingOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-10 max-w-5xl">
        {/* Welcome & Quick Stats */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Your Decision Hub</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Take your time. Each decision deserves your full attention.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { value: decisions.length, label: 'Total', color: 'text-foreground' },
              { value: completedDecisions.length, label: 'Completed', color: 'text-primary' },
              { value: inProgressDecisions.length, label: 'In Progress', color: 'text-foreground' },
            ].map((stat, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upgrade Banner for free users */}
        {!hasPaid && decisions.length >= 1 && (
          <Card className="border-primary/30 bg-primary/5 mb-4 sm:mb-6">
            <CardContent className="py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">Unlock unlimited clarity</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Unlimited decisions, AI bias detection, scenario modeling & more</p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate('/pricing')} className="gap-1.5 shrink-0 h-8 text-xs sm:text-sm w-full sm:w-auto">
                <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        )}

        {pendingReflections.length > 0 && (
          <Card className="border-primary/30 bg-primary/5 mb-4 sm:mb-6">
            <CardContent className="py-3 sm:py-4">
              <p className="text-xs sm:text-sm text-foreground">
                🔄 {pendingReflections.length} decision{pendingReflections.length > 1 ? 's' : ''} ready for reflection.{' '}
                <button onClick={() => navigate(`/reflect/${pendingReflections[0].id}`)} className="text-primary underline underline-offset-2 font-medium">Start reflection</button>
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {/* Left column — main content */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
              <Button onClick={() => navigate('/decision/new')} size="lg" className="gap-1.5 sm:gap-2 sm:flex-1 h-11 sm:h-12 text-xs sm:text-sm">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">New Deep Decision</span>
                <span className="sm:hidden">Deep Decision</span>
              </Button>
              <Button onClick={() => navigate('/decision/new?mode=quick')} variant="outline" size="lg" className="gap-1.5 sm:gap-2 sm:flex-1 h-11 sm:h-12 text-xs sm:text-sm">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                Quick Decision
              </Button>
              {hasPaid && completedDecisions.length >= 2 && (
                <Button variant="outline" onClick={() => navigate('/compare')} size="lg" className="gap-1.5 col-span-2 sm:col-span-1 h-11 sm:h-12 text-xs sm:text-sm">
                  <GitCompare className="h-4 w-4 sm:h-5 sm:w-5" />Compare
                </Button>
              )}
            </div>

            {/* Category Filters */}
            {decisions.length > 3 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')} className="h-7 sm:h-8 text-xs">All</Button>
                {DECISION_CATEGORIES.map(cat => {
                  const count = decisions.filter(d => d.category === cat.value).length;
                  if (count === 0) return null;
                  return (
                    <Button key={cat.value} variant={filter === cat.value ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter(cat.value)} className="h-7 sm:h-8 text-xs">
                      {cat.label} ({count})
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Decision Cards */}
            {filteredDecisions.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {filteredDecisions.map(decision => (
                  <Card key={decision.id} className="cursor-pointer hover:border-primary/30 transition-all border-border/50 active:scale-[0.99]" onClick={() => navigate(`/decision/${decision.id}`)}>
                    <CardContent className="p-3 sm:p-4 md:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-medium text-foreground truncate">{decision.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] sm:text-xs h-5">{getCategoryLabel(decision.category)}</Badge>
                            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />{format(new Date(decision.created_at), 'MMM d')}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {decision.is_locked ? (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              <span className="hidden xs:inline">Done</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                              <Clock className="h-3 w-3" />
                              <span className="hidden xs:inline">Active</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {decision.confidence_rating && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden max-w-[100px]">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${decision.confidence_rating * 10}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{decision.confidence_rating}/10</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-border/50">
                <CardContent className="py-10 sm:py-12 text-center space-y-3 sm:space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-foreground font-medium">
                      {filter === 'all' ? 'Ready to make your first decision?' : 'No decisions in this category yet.'}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {filter === 'all' ? 'Start with a quick decision to see how Clarity helps you think clearer.' : 'Try creating a new decision in this category.'}
                    </p>
                  </div>
                  {filter === 'all' && (
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={() => navigate('/decision/new?mode=quick')} className="gap-2 h-10">
                        <Zap className="h-4 w-4" />
                        Try a quick decision
                      </Button>
                      <Button onClick={() => navigate('/decision/new')} variant="outline" className="gap-2 h-10">
                        <Plus className="h-4 w-4" />
                        Deep decision
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column — features sidebar */}
          <div className="space-y-3 sm:space-y-4">
            <MoodCheckIn />
            <DecisionStreaks />
            
            {/* Pro Features Teaser for free users */}
            {!hasPaid && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                    <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    Pro Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 pt-0 sm:p-4 sm:pt-0">
                  <ul className="space-y-1.5 text-[10px] sm:text-xs text-muted-foreground">
                    {[
                      { icon: Sparkles, text: 'AI scenario modeling' },
                      { icon: Brain, text: '180+ bias detection' },
                      { icon: BarChart3, text: 'Decision quality scoring' },
                      { icon: TrendingUp, text: 'AI predictions & insights' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5 sm:gap-2">
                        <item.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="w-full gap-1.5 mt-2 h-8 text-xs" onClick={() => navigate('/pricing')}>
                    <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Unlock Pro
                  </Button>
                </CardContent>
              </Card>
            )}

            <SmartTemplates />
            {hasPaid && <AiPredictions />}
            <DecisionTimeline />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
