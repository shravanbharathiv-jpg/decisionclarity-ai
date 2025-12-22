import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, LogOut, Calendar, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Decision {
  id: string;
  title: string;
  status: string;
  created_at: string;
  is_locked: boolean;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
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
        .select('id, title, status, created_at, is_locked')
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
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
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

          <div className="flex justify-center">
            <Button onClick={() => navigate('/decision/new')} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Start a new decision
            </Button>
          </div>

          {decisions.length > 0 ? (
            <div className="space-y-4">
              {decisions.map((decision) => (
                <Card 
                  key={decision.id} 
                  className="cursor-pointer hover:border-primary/30 transition-colors border-border/50"
                  onClick={() => navigate(`/decision/${decision.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-medium">{decision.title}</CardTitle>
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
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(decision.created_at), 'MMM d, yyyy')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No decisions yet. Start your first one when you're ready.
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
