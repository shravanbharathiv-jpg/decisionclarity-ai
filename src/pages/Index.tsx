import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Shield, Sparkles, Lock, TrendingUp, Clock, Target, Zap } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    navigate(user ? '/dashboard' : '/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Clarity</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/pricing')}>
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
              {user ? 'Dashboard' : 'Sign in'}
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">
            Make decisions with clarity, not anxiety
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            A structured system for working through life's important choices. 
            AI-powered analysis helps you see clearly and decide confidently.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="gap-2">
              Start your first decision
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/pricing')}>
              View pricing
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free to try • Pro from £9.99/month
          </p>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h3 className="text-2xl font-semibold text-center mb-12">How it works</h3>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Brain, title: 'Deconstruct', description: 'Break down your decision with guided questions' },
                { icon: Sparkles, title: 'Analyze', description: 'AI identifies patterns and blind spots' },
                { icon: Shield, title: 'Check biases', description: 'Uncover cognitive biases affecting your thinking' },
                { icon: Lock, title: 'Lock & commit', description: 'Record your decision and end the deliberation' },
              ].map((step, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 max-w-5xl">
          <h3 className="text-2xl font-semibold text-center mb-12">Why Clarity works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: TrendingUp, 
                title: 'Second-Order Thinking', 
                description: 'See beyond immediate consequences. Understand the ripple effects of every choice.' 
              },
              { 
                icon: Target, 
                title: 'Bias Detection', 
                description: 'AI analyzes your reasoning to identify cognitive biases you might not notice.' 
              },
              { 
                icon: Clock, 
                title: 'Long-Term Reflections', 
                description: 'Revisit decisions at 30, 90, and 180 days to learn from outcomes.' 
              },
            ].map((feature, index) => (
              <div key={index} className="p-6 rounded-lg border border-border/50 bg-card">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary/5 py-20">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <Zap className="h-12 w-12 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">One good decision pays for this forever</h3>
            <p className="text-muted-foreground mb-8">
              Stop second-guessing. Stop losing sleep. Get the clarity you need to move forward.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted}>
                Get started now
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/pricing')}>
                See pricing plans
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Clarity. Make decisions with confidence.
        </div>
      </footer>
    </div>
  );
};

export default Index;
