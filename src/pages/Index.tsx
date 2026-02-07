import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import LiveDecisionDemo from '@/components/landing/LiveDecisionDemo';
import ClarityGuide from '@/components/landing/ClarityGuide';
import QuickDecisionWidget from '@/components/landing/QuickDecisionWidget';
import { 
  ArrowRight, Brain, Shield, Sparkles, Lock, TrendingUp, Clock, Target, 
  Zap, CheckCircle, AlertTriangle, Scale, Lightbulb, ChevronRight,
  Play, ArrowDown, Star, Users, Award, Heart
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate(user ? '/dashboard' : '/auth');
  };

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const decisionTypes = [
    { emoji: '💼', text: 'Should I quit my job?' },
    { emoji: '🏠', text: 'Buy or rent?' },
    { emoji: '💑', text: 'Is this relationship right?' },
    { emoji: '🎓', text: 'Which degree to pursue?' },
    { emoji: '🌍', text: 'Should I relocate?' },
    { emoji: '💰', text: 'Investment decisions' },
  ];

  const processSteps = [
    { 
      icon: Brain, 
      title: 'Deconstruct', 
      description: 'Break your decision into clear components',
      active: activeStep === 0 
    },
    { 
      icon: Sparkles, 
      title: 'Analyze', 
      description: 'AI models best, worst & likely outcomes',
      active: activeStep === 1 
    },
    { 
      icon: Shield, 
      title: 'Bias Check', 
      description: 'Detect cognitive blind spots',
      active: activeStep === 2 
    },
    { 
      icon: Lock, 
      title: 'Commit', 
      description: 'Lock in and end the deliberation',
      active: activeStep === 3 
    },
  ];

  const trustReasons = [
    { icon: Shield, text: 'Bank-level encryption', subtext: 'Your data is protected' },
    { icon: Lock, text: 'Private by design', subtext: 'We never sell your data' },
    { icon: Award, text: 'Research-backed', subtext: 'Based on decision science' },
    { icon: Heart, text: 'Built for you', subtext: 'No ads, no distractions' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <header className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Clarity</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={scrollToDemo} className="hidden sm:inline-flex">
              Try Demo
            </Button>
            <Button variant="ghost" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
              {user ? 'Dashboard' : 'Sign in'}
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className={`container mx-auto px-4 py-12 md:py-20 text-center max-w-4xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Badge className="mb-6 bg-primary/10 text-primary border-0 px-4 py-1.5 animate-pulse">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            First 50 users get 1 full decision FREE
          </Badge>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
            You're not indecisive.
            <br />
            <span className="text-primary">You just need a system.</span>
          </h2>
          
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The decisions that keep you up at night? There's a structured way to work through them. 
            AI-powered clarity for life's biggest choices.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted} 
              className="gap-2 text-base md:text-lg px-8 py-6 md:py-7 group transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Make your first decision free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={scrollToDemo} 
              className="gap-2 text-base md:text-lg px-8 py-6 md:py-7 group transition-all duration-300"
            >
              <Play className="h-5 w-5" />
              Try it yourself first
            </Button>
          </div>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              Private & encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              Takes 10-15 minutes
            </span>
          </div>

          <div className="mt-12 animate-bounce cursor-pointer" onClick={scrollToDemo}>
            <ArrowDown className="h-5 w-5 mx-auto text-muted-foreground" />
          </div>
        </section>

        {/* Decision Types Carousel */}
        <section className="py-12 bg-muted/30 overflow-hidden">
          <div className="container mx-auto px-4 mb-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">Sound familiar?</p>
          </div>
          <div className="relative">
            <div className="flex animate-scroll gap-4">
              {[...decisionTypes, ...decisionTypes].map((item, i) => (
                <div 
                  key={i}
                  className="flex-shrink-0 px-6 py-3 rounded-full bg-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default"
                >
                  <span className="mr-2">{item.emoji}</span>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Banner */}
        <section className="py-8 border-y border-border/30 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {trustReasons.map((item, i) => (
                <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="outline" className="text-destructive border-destructive/30">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                  The Problem
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Big decisions paralyze you
                </h3>
                <ul className="space-y-4">
                  {[
                    'Endless pros/cons lists that go nowhere',
                    'Asking friends who don\'t have your context',
                    '3am anxiety spirals about "what if"',
                    'Delaying until life decides for you',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-destructive mt-1">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <Badge variant="outline" className="text-primary border-primary/30">
                  <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                  The Solution
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  A system that actually works
                </h3>
                <ul className="space-y-4">
                  {[
                    'Structured framework used by executives',
                    'AI that spots biases you can\'t see',
                    'Scenario modeling for confident choices',
                    'Lock in decisions and move forward',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Decision Widget */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-lg">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                For everyday choices
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Need a quick answer?
              </h3>
              <p className="text-muted-foreground mt-2">
                Not every decision needs deep analysis. Try our 30-second quick decision tool.
              </p>
            </div>
            <QuickDecisionWidget />
          </div>
        </section>

        {/* Interactive Process Demo */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                See it in action
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                The 4-Step Clarity Process
              </h3>
              <p className="mt-3 text-muted-foreground">
                Watch how Clarity transforms chaotic thoughts into clear action
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {processSteps.map((step, index) => (
                <Card 
                  key={index}
                  className={`p-6 text-center cursor-pointer transition-all duration-500 ${
                    step.active 
                      ? 'border-primary bg-primary/5 scale-105 shadow-lg' 
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                    step.active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    <step.icon className="h-7 w-7" />
                  </div>
                  <span className={`inline-block mb-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                    step.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    Step {index + 1}
                  </span>
                  <h4 className="font-semibold text-foreground">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </Card>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button 
                size="lg" 
                variant="outline" 
                onClick={scrollToDemo}
                className="gap-2 group"
              >
                Try it yourself—it's free
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Why Clarity works when willpower doesn't
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Target, 
                title: 'AI Bias Detection', 
                description: 'Your brain has 180+ cognitive biases. Our AI catches the ones affecting your decision—before you commit.' 
              },
              { 
                icon: TrendingUp, 
                title: 'Second-Order Thinking', 
                description: '"And then what?" See the ripple effects of your choices 6, 12, 24 months into the future.' 
              },
              { 
                icon: Scale, 
                title: 'Scenario Modeling', 
                description: 'Best case, worst case, likely case. Know exactly what you\'re signing up for with each path.' 
              },
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 border-border/50 hover:border-primary/30 transition-all duration-300 group hover:shadow-lg"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2 text-foreground">{feature.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Live Interactive Demo Section */}
        <section ref={demoRef} className="py-16 md:py-24 bg-muted/30 scroll-mt-20" id="demo">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-primary/10 text-primary border-0">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Try Before You Sign Up
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Experience Clarity in action
              </h3>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                Walk through a real decision analysis—no account needed. 
                See exactly how our AI helps you think clearer.
              </p>
            </div>

            <LiveDecisionDemo />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Limited: First 50 early adopters</span>
            </div>
            
            <h3 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">
              Your next decision doesn't have to be this hard
            </h3>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Stop second-guessing. Stop losing sleep. Start making decisions you're proud of—beginning with your first one, completely free.
            </p>
            
            <Button 
              size="lg" 
              onClick={handleGetStarted} 
              className="gap-2 text-lg px-10 py-7 group transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Make your first decision now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="mt-6 text-sm text-muted-foreground">
              Your first decision is free • Then unlock exclusive early adopter pricing
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                Bank-level encryption
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                7-day money back guarantee
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Clarity. Make decisions with confidence.
        </div>
      </footer>

      {/* Clarity Guide Mascot */}
      <ClarityGuide 
        onTryDemo={scrollToDemo}
        onGetStarted={handleGetStarted}
      />

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Index;
