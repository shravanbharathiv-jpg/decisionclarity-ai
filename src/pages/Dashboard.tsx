import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, LogOut, Calendar, CheckCircle, Clock, Loader2, GitCompare, Brain, Settings } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { DECISION_CATEGORIES } from '@/types/decision';

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
  const { user, loading: authLoading, signOut, hasPaid, subscriptionTier } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchDecisions = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('decisions')
        .select('id, title, status, category, created_at, is_locked, locked_at, confidence_rating')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching decisions:', error);
      } else {
        setDecisions(data || []);
      }
      setLoading(false);
    };

    if (user) {
      fetchDecisions();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredDecisions = filter === 'all' 
    ? decisions 
    : decisions.filter(d => d.category === filter);

  const completedDecisions = decisions.filter(d => d.is_locked);
  const pendingReflections = completedDecisions.filter(d => {
    if (!d.locked_at) return false;
    const days = differenceInDays(new Date(), new Date(d.locked_at));
    return days >= 30;
  });

  const getCategoryLabel = (value: string) => {
    return DECISION_CATEGORIES.find(c => c.value === value)?.label || value;
  };

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
          <div className="flex items-center gap-2">
            {hasPaid && (
              <Badge variant="secondary" className="text-xs">
                {subscriptionTier === 'lifetime' ? 'Lifetime' : 'Premium'}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <Brain className="h-4 w-4 mr-2" />
              Insights
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Your Decisions</h2>
            <p className="text-muted-foreground">
              Take your time. Each decision deserves your full attention.
            </p>
          </div>

          {pendingReflections.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <p className="text-sm text-foreground">
                  {pendingReflections.length} decision{pendingReflections.length > 1 ? 's' : ''} ready for reflection.{' '}
                  <button 
                    onClick={() => navigate(`/decision/${pendingReflections[0].id}/reflect`)}
                    className="text-primary underline underline-offset-2"
                  >
                    Start reflection
                  </button>
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate('/decision/new')} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New decision
            </Button>
            {hasPaid && completedDecisions.length >= 2 && (
              <Button variant="outline" onClick={() => navigate('/compare')} size="lg" className="gap-2">
                <GitCompare className="h-5 w-5" />
                Compare decisions
              </Button>
            )}
          </div>

          {decisions.length > 3 && (
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant={filter === 'all' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              {DECISION_CATEGORIES.map((cat) => {
                const count = decisions.filter(d => d.category === cat.value).length;
                if (count === 0) return null;
                return (
                  <Button 
                    key={cat.value}
                    variant={filter === cat.value ? 'secondary' : 'ghost'} 
                    size="sm"
                    onClick={() => setFilter(cat.value)}
                  >
                    {cat.label} ({count})
                  </Button>
                );
              })}
            </div>
          )}

          {filteredDecisions.length > 0 ? (
            <div className="space-y-4">
              {filteredDecisions.map((decision) => (
                <Card 
                  key={decision.id} 
                  className="cursor-pointer hover:border-primary/30 transition-colors border-border/50"
                  onClick={() => navigate(`/decision/${decision.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-medium">{decision.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(decision.category)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {decision.is_locked ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                            <Clock className="h-3 w-3" />
                            In progress
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(decision.created_at), 'MMM d, yyyy')}
                      </div>
                      {decision.confidence_rating && (
                        <span className="text-xs text-muted-foreground">
                          Confidence: {decision.confidence_rating}/10
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'No decisions yet. Start your first one when you are ready.'
                    : 'No decisions in this category.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
