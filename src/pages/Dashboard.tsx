import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, LogOut, Calendar, CheckCircle, Clock, Loader2, GitCompare, Brain, Settings, CreditCard, Shield, Menu, Zap, Sparkles, TrendingUp, ArrowRight, Crown, Target, BarChart3 } from 'lucide-react';
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
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Clarity</h1>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {hasPaid && (
              <Badge variant="secondary" className="text-xs">
                {subscriptionTier === 'lifetime' ? 'Lifetime' : 'Pro'}
              </Badge>
            )}
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                <Shield className="h-4 w-4 mr-2" />Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <Brain className="h-4 w-4 mr-2" />Insights
            </Button>
            {!hasPaid && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/pricing')} className="text-primary">
                <Crown className="h-4 w-4 mr-2" />Upgrade to Pro
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
              {signingOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {hasPaid && <Badge variant="secondary" className="text-xs">{subscriptionTier === 'lifetime' ? 'Lifetime' : 'Pro'}</Badge>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm"><Menu className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAdmin && <DropdownMenuItem onClick={() => navigate('/admin')}><Shield className="h-4 w-4 mr-2" />Admin</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => navigate('/profile')}><Brain className="h-4 w-4 mr-2" />Insights</DropdownMenuItem>
                {!hasPaid && <DropdownMenuItem onClick={() => navigate('/pricing')}><Crown className="h-4 w-4 mr-2" />Upgrade to Pro</DropdownMenuItem>}
                <DropdownMenuItem onClick={handleSignOut} disabled={signingOut}>
                  {signingOut ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-5xl">
        {/* Welcome & Stats Row */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">Your Decision Hub</h2>
              <p className="text-sm text-muted-foreground">Take your time. Each decision deserves your full attention.</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-border/50">
              <CardContent className="py-3 px-4 text-center">
                <p className="text-2xl font-bold text-foreground">{decisions.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="py-3 px-4 text-center">
                <p className="text-2xl font-bold text-primary">{completedDecisions.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="py-3 px-4 text-center">
                <p className="text-2xl font-bold text-foreground">{inProgressDecisions.length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upgrade Banner for free users */}
        {!hasPaid && decisions.length >= 2 && (
          <Card className="border-primary/30 bg-primary/5 mb-6">
            <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Unlock unlimited clarity</p>
                  <p className="text-xs text-muted-foreground">Get unlimited decisions, AI bias detection, scenario modeling & more</p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate('/pricing')} className="gap-1.5 shrink-0">
                <Crown className="h-3.5 w-3.5" />
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        )}

        {pendingReflections.length > 0 && (
          <Card className="border-primary/30 bg-primary/5 mb-6">
            <CardContent className="py-4">
              <p className="text-sm text-foreground">
                🔄 {pendingReflections.length} decision{pendingReflections.length > 1 ? 's' : ''} ready for reflection.{' '}
                <button onClick={() => navigate(`/reflect/${pendingReflections[0].id}`)} className="text-primary underline underline-offset-2 font-medium">Start reflection</button>
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left column — main content */}
          <div className="md:col-span-2 space-y-4">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => navigate('/decision/new')} size="lg" className="gap-2 flex-1">
                <Plus className="h-5 w-5" />New Deep Decision
              </Button>
              <Button onClick={() => navigate('/decision/new?mode=quick')} variant="outline" size="lg" className="gap-2 flex-1">
                <Zap className="h-5 w-5" />Quick Decision
              </Button>
              {hasPaid && completedDecisions.length >= 2 && (
                <Button variant="outline" onClick={() => navigate('/compare')} size="lg" className="gap-2">
                  <GitCompare className="h-5 w-5" />Compare
                </Button>
              )}
            </div>

            {decisions.length > 3 && (
              <div className="flex flex-wrap gap-2">
                <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>All</Button>
                {DECISION_CATEGORIES.map(cat => {
                  const count = decisions.filter(d => d.category === cat.value).length;
                  if (count === 0) return null;
                  return <Button key={cat.value} variant={filter === cat.value ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter(cat.value)}>{cat.label} ({count})</Button>;
                })}
              </div>
            )}

            {filteredDecisions.length > 0 ? (
              <div className="space-y-3">
                {filteredDecisions.map(decision => (
                  <Card key={decision.id} className="cursor-pointer hover:border-primary/30 transition-colors border-border/50" onClick={() => navigate(`/decision/${decision.id}`)}>
                    <CardHeader className="pb-2 p-4 md:p-6 md:pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <CardTitle className="text-base md:text-lg font-medium truncate">{decision.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">{getCategoryLabel(decision.category)}</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {decision.is_locked ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"><CheckCircle className="h-3 w-3" /><span className="hidden sm:inline">Completed</span></span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"><Clock className="h-3 w-3" /><span className="hidden sm:inline">In progress</span></span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-4 md:p-6 md:pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />{format(new Date(decision.created_at), 'MMM d, yyyy')}
                        </div>
                        {decision.confidence_rating && <span className="text-xs text-muted-foreground">Confidence: {decision.confidence_rating}/10</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-border/50">
                <CardContent className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      {filter === 'all' ? 'Ready to make your first decision?' : 'No decisions in this category yet.'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filter === 'all' ? 'Start with a quick decision to see how Clarity helps you think clearer.' : 'Try creating a new decision in this category.'}
                    </p>
                  </div>
                  {filter === 'all' && (
                    <Button onClick={() => navigate('/decision/new?mode=quick')} className="gap-2">
                      <Zap className="h-4 w-4" />
                      Try a quick decision
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column — features sidebar */}
          <div className="space-y-4">
            <MoodCheckIn />
            <DecisionStreaks />
            
            {/* Pro Features Teaser for free users */}
            {!hasPaid && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary" />
                    Pro Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {[
                      { icon: Sparkles, text: 'AI scenario modeling' },
                      { icon: Brain, text: '180+ bias detection' },
                      { icon: BarChart3, text: 'Decision quality scoring' },
                      { icon: TrendingUp, text: 'AI predictions & insights' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="w-full gap-1.5 mt-2" onClick={() => navigate('/pricing')}>
                    <Crown className="h-3.5 w-3.5" />
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
