import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Brain, Shield, Sparkles, Lock, TrendingUp, Clock, Target, Zap, CheckCircle, Star, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    navigate(user ? '/dashboard' : '/onboarding');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Clarity</h1>
          <Button variant="ghost" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
            {user ? 'Dashboard' : 'Sign in'}
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section - Emotional & Urgent */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center max-w-3xl">
          <Badge className="mb-6 bg-primary/10 text-primary border-0 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            First 50 users get 1 full decision FREE
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">
            Stop the 3am anxiety spiral.
            <br />
            <span className="text-primary">Decide with clarity.</span>
          </h2>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            You're not indecisive. You're thoughtful. Clarity gives you a structured system 
            to work through life's important choices—with AI that spots your blind spots.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="gap-2 text-base px-8 py-6">
              Make your first decision free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-green-500" />
              Private & secure
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-green-500" />
              Takes 10 minutes
            </span>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-wrap items-center justify-center gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-foreground">1,247+</p>
                <p className="text-sm text-muted-foreground">Decisions made</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">4.9/5</p>
                <p className="text-sm text-muted-foreground">User rating</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">89%</p>
                <p className="text-sm text-muted-foreground">Feel more confident</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h3 className="text-2xl font-semibold text-center mb-4">How it works</h3>
            <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
              A 5-step system used by executives, founders, and anyone who wants to stop second-guessing.
            </p>
            <div className="grid md:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: Brain, title: 'Deconstruct', description: 'Break down your decision with guided questions' },
                { icon: Sparkles, title: 'AI Analysis', description: 'Get insights on best, worst & likely outcomes' },
                { icon: Shield, title: 'Bias Check', description: 'AI detects cognitive blind spots in your thinking' },
                { icon: Lock, title: 'Lock & Commit', description: 'Record your decision and end the deliberation' },
              ].map((step, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative">
                    <step.icon className="h-7 w-7 text-primary" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <h3 className="text-2xl font-semibold text-center mb-12">People like you are winning</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "I was stuck for 3 months on whether to leave my job. Clarity helped me decide in one evening. The bias detection was eye-opening.",
                  author: "Sarah M.",
                  role: "Product Manager",
                },
                {
                  quote: "The AI showed me I was anchored on sunk costs. Saved me from a £50k mistake. Worth every penny.",
                  author: "James T.",
                  role: "Startup Founder",
                },
                {
                  quote: "Finally, a tool that matches how my brain actually works. The second-order thinking feature is brilliant.",
                  author: "Dr. Rachel K.",
                  role: "Clinical Psychologist",
                },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-xl bg-card border border-border/50">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">"{item.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                      {item.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.author}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16 md:py-20 max-w-5xl">
          <h3 className="text-2xl font-semibold text-center mb-12">Why Clarity works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: TrendingUp, 
                title: 'Second-Order Thinking', 
                description: 'See beyond immediate consequences. Understand the ripple effects of every choice.' 
              },
              { 
                icon: Target, 
                title: 'AI Bias Detection', 
                description: 'AI analyzes your reasoning to identify cognitive biases you might not notice.' 
              },
              { 
                icon: Clock, 
                title: 'Long-Term Reflections', 
                description: 'Revisit decisions at 30, 90, and 180 days to learn from outcomes.' 
              },
            ].map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary/5 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Limited: First 50 users</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">One good decision pays for this forever</h3>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Stop second-guessing. Stop losing sleep. Get the clarity you need to move forward—starting with your first decision, completely free.
            </p>
            <Button size="lg" onClick={handleGetStarted} className="gap-2 text-base px-8 py-6">
              Start your free decision now
              <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Then 7-day free trial • Special early adopter pricing
            </p>
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