import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import LiveDecisionDemo from '@/components/landing/LiveDecisionDemo';
import QuickDecisionWidget from '@/components/landing/QuickDecisionWidget';
import { 
  ArrowRight, Brain, Shield, Sparkles, Lock, TrendingUp, Clock, Target, 
  Zap, CheckCircle, AlertTriangle, Scale, Lightbulb, ChevronRight,
  Play, ArrowDown, Star, Users, Award, Heart, MessageCircle, BarChart3
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

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
    demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const decisionTypes = [
    { emoji: '💼', text: 'Should I quit my job?' },
    { emoji: '🏠', text: 'Buy or rent a home?' },
    { emoji: '💑', text: 'Is this relationship right?' },
    { emoji: '🎓', text: 'Which university degree?' },
    { emoji: '🌍', text: 'Should I relocate abroad?' },
    { emoji: '💰', text: 'Investment decisions' },
    { emoji: '🏥', text: 'Health treatment choices' },
    { emoji: '👶', text: 'Ready for parenthood?' },
    { emoji: '🚗', text: 'New car or used?' },
    { emoji: '📱', text: 'Career pivot or stay?' },
  ];

  const processSteps = [
    { icon: Brain, title: 'Deconstruct', description: 'Break your decision into clear, manageable components', active: activeStep === 0 },
    { icon: Sparkles, title: 'Analyze Scenarios', description: 'AI models best, worst & most likely outcomes', active: activeStep === 1 },
    { icon: Shield, title: 'Detect Biases', description: 'Catch 180+ cognitive blind spots automatically', active: activeStep === 2 },
    { icon: Lock, title: 'Commit & Act', description: 'Lock in your decision and end the deliberation', active: activeStep === 3 },
  ];

  const testimonials = [
    { name: 'Sarah K.', role: 'Product Manager', text: 'Clarity helped me decide to leave my toxic job. Best decision I ever made. The bias detection caught my fear of change.', rating: 5 },
    { name: 'James R.', role: 'Entrepreneur', text: 'I was stuck for months on whether to bootstrap or seek funding. 15 minutes with Clarity and I had total clarity.', rating: 5 },
    { name: 'Priya M.', role: 'Graduate Student', text: 'Used it to choose between PhD programs. The scenario modeling showed me things I never considered.', rating: 5 },
  ];

  const faqs = [
    { q: 'What is a decision making app?', a: 'A decision making app like Clarity helps you systematically analyze complex life decisions using AI-powered frameworks, bias detection, and scenario modeling — instead of relying on gut feeling or endless pros/cons lists.' },
    { q: 'How does Clarity help me make better decisions?', a: 'Clarity uses a proven 4-step process: 1) Deconstruct your decision into clear components, 2) Model best/worst/likely scenarios with AI, 3) Detect cognitive biases like confirmation bias and sunk cost fallacy, 4) Lock in your decision with confidence.' },
    { q: 'Is Clarity free to use?', a: 'Yes! The free plan includes 5 quick decision analyses per month. The first 10 early adopters also get 1 full deep decision analysis completely free. Pro plans with unlimited decisions start at just £9.99/month with a 7-day free trial.' },
    { q: 'What types of decisions can I analyze?', a: 'Clarity works for any major life decision: career changes, buying vs renting, relationship decisions, investment choices, university selection, relocation, health decisions, and more. If it keeps you up at night, Clarity can help.' },
    { q: 'What cognitive biases does Clarity detect?', a: 'Clarity\'s AI detects 180+ cognitive biases including confirmation bias, sunk cost fallacy, anchoring bias, availability heuristic, loss aversion, status quo bias, and many more that silently affect your decision making.' },
    { q: 'How is this different from a pros and cons list?', a: 'Pros/cons lists are flat and biased by whatever you think of first. Clarity uses structured decision science frameworks, AI-powered scenario modeling, cognitive bias detection, and second-order thinking to reveal what you can\'t see on your own.' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Sticky Header */}
      <header className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-50" role="banner">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between" aria-label="Main navigation">
          <a href="/" className="flex items-center gap-2" aria-label="Clarity - Decision Making App Home">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">Clarity</span>
          </a>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/pricing')} className="hidden sm:inline-flex">
              Pricing
            </Button>
            <Button variant="ghost" size="sm" onClick={scrollToDemo} className="hidden sm:inline-flex">
              Try Demo
            </Button>
            <Button variant="default" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
              {user ? 'Dashboard' : 'Start Free →'}
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Urgency Banner */}
        <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            🚀 First 10 users get 1 deep decision <strong>completely FREE</strong>
            <Button variant="secondary" size="sm" className="ml-2 h-7 text-xs" onClick={handleGetStarted}>
              Claim yours
            </Button>
          </span>
        </div>

        {/* Hero Section — keyword-rich */}
        <section className={`container mx-auto px-4 py-12 md:py-20 text-center max-w-4xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Badge className="mb-6 bg-primary/10 text-primary border-0 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            AI-Powered Decision Making App
          </Badge>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
            Stop Overthinking.
            <br />
            <span className="text-primary">Make Decisions with AI-Powered Clarity.</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The <strong>decision making app</strong> that uses AI bias detection, scenario modeling, 
            and structured frameworks to help you make life's biggest choices — in minutes, not months.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted} 
              className="gap-2 text-base md:text-lg px-8 py-6 md:py-7 group transition-all duration-300 hover:scale-105 shadow-lg"
              aria-label="Start making better decisions for free"
            >
              Make your first decision — it's free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={scrollToDemo} 
              className="gap-2 text-base md:text-lg px-8 py-6 md:py-7 group transition-all duration-300"
              aria-label="Try the interactive decision making demo"
            >
              <Play className="h-5 w-5" />
              Try the live demo first
            </Button>
          </div>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
              No credit card needed
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              Bank-level encryption
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              Results in 10 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Based on decision science research
            </span>
          </div>

          <div className="mt-12 animate-bounce cursor-pointer" onClick={scrollToDemo}>
            <ArrowDown className="h-5 w-5 mx-auto text-muted-foreground" />
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-4 bg-muted/50 border-y border-border/30" aria-label="Social proof">
          <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {['bg-primary', 'bg-accent', 'bg-destructive', 'bg-primary/70'].map((bg, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${bg} border-2 border-background flex items-center justify-center text-[10px] text-primary-foreground font-bold`}>
                    {['S', 'J', 'P', 'M'][i]}
                  </div>
                ))}
              </div>
              <span className="font-medium">2,147 decisions made this week</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-1 font-medium">4.9/5 average rating</span>
            </div>
          </div>
        </section>

        {/* Decision Types Carousel — SEO-rich */}
        <section className="py-12 bg-muted/30 overflow-hidden" aria-label="Types of decisions Clarity helps with">
          <div className="container mx-auto px-4 mb-6 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-1">Decisions Clarity Helps You Make</h2>
            <p className="text-sm text-muted-foreground">From career changes to life's biggest crossroads</p>
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
        <section className="py-8 border-y border-border/30 bg-muted/20" aria-label="Trust and security">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Shield, text: 'Bank-level encryption', subtext: 'Your decisions are protected' },
                { icon: Lock, text: 'Private by design', subtext: 'We never sell your data' },
                { icon: Award, text: 'Research-backed', subtext: 'Based on decision science' },
                { icon: Heart, text: 'No ads, ever', subtext: 'Built for you, not advertisers' },
              ].map((item, i) => (
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
        <section className="py-16 md:py-24" aria-label="Why you need a decision making tool">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <article className="space-y-6">
                <Badge variant="outline" className="text-destructive border-destructive/30">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                  The Problem
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Analysis paralysis is ruining your life
                </h2>
                <ul className="space-y-4">
                  {[
                    'Endless pros/cons lists that go nowhere',
                    'Asking friends who don\'t understand your situation',
                    '3am anxiety spirals about "what if I choose wrong?"',
                    'Delaying until life decides for you',
                    'Regretting decisions made under pressure',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-destructive mt-1 shrink-0">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="space-y-6">
                <Badge variant="outline" className="text-primary border-primary/30">
                  <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                  The Clarity Solution
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  A proven decision making system
                </h2>
                <ul className="space-y-4">
                  {[
                    'Structured framework used by Fortune 500 executives',
                    'AI that detects 180+ cognitive biases you can\'t see',
                    'Scenario modeling: best case, worst case, likely case',
                    'Second-order thinking: see ripple effects years ahead',
                    'Lock in and commit — end the deliberation forever',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Quick Decision Widget */}
        <section className="py-16 md:py-20 bg-muted/30" aria-label="Quick decision analysis tool">
          <div className="container mx-auto px-4 max-w-lg">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Free Decision Tool
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Try a quick decision analysis
              </h2>
              <p className="text-muted-foreground mt-2">
                Not every decision needs deep analysis. Get AI-powered clarity in 30 seconds — completely free.
              </p>
            </div>
            <QuickDecisionWidget />
          </div>
        </section>

        {/* Interactive 4-Step Process */}
        <section className="py-16 md:py-24" aria-label="How Clarity's decision making process works">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                How It Works
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                The 4-Step Decision Making Framework
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Used by thousands to transform chaotic overthinking into clear, confident action
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
                  role="button"
                  aria-label={`Step ${index + 1}: ${step.title}`}
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
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </Card>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" onClick={handleGetStarted} className="gap-2 group">
                Start your analysis free
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features / What Makes Us Different */}
        <section className="container mx-auto px-4 py-16 md:py-24 max-w-5xl" aria-label="AI decision making features">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Features That Make Clarity the Best Decision Making App
            </h2>
            <p className="mt-3 text-muted-foreground">Powered by decision science research and advanced AI</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Target, 
                title: 'AI Cognitive Bias Detection', 
                description: 'Your brain has 180+ cognitive biases. Clarity\'s AI catches confirmation bias, sunk cost fallacy, anchoring, and more — before you commit.' 
              },
              { 
                icon: TrendingUp, 
                title: 'Second-Order Thinking', 
                description: '"And then what?" See the ripple effects of your choices 6, 12, and 24 months into the future. Think like a chess grandmaster.' 
              },
              { 
                icon: Scale, 
                title: 'Scenario Modeling', 
                description: 'Best case, worst case, most likely case. Know exactly what you\'re signing up for before you commit to any path.' 
              },
              { 
                icon: BarChart3, 
                title: 'Decision Quality Score', 
                description: 'Get a 0-100 score on your decision quality. Track how your decision making improves over time with data-driven insights.' 
              },
              { 
                icon: MessageCircle, 
                title: 'AI Decision Coach (Clair)', 
                description: 'Chat with Clair, your personal AI decision coach. Ask questions, explore options, and get guidance at every step.' 
              },
              { 
                icon: Zap, 
                title: 'Quick & Deep Modes', 
                description: 'Quick mode for everyday choices in 30 seconds. Deep mode for life-changing decisions with full AI analysis and scenario modeling.' 
              },
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 border-border/50 hover:border-primary/30 transition-all duration-300 group hover:shadow-lg"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-muted/30" aria-label="What users say about Clarity">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Real People, Real Decisions, Real Results
              </h2>
              <p className="mt-3 text-muted-foreground">See how Clarity helped others stop overthinking</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Card key={i} className="p-6 border-border/50">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-muted-foreground mb-4 leading-relaxed italic">
                    "{t.text}"
                  </blockquote>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Live Interactive Demo Section */}
        <section ref={demoRef} className="py-16 md:py-24 scroll-mt-20" id="demo" aria-label="Interactive decision making demo">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-primary/10 text-primary border-0">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Try Before You Sign Up
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Experience the AI decision making process
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                Walk through a real decision analysis — no account needed. 
                See exactly how AI helps you think clearer about tough choices.
              </p>
            </div>
            <LiveDecisionDemo />
          </div>
        </section>

        {/* FAQ Section — massive SEO value */}
        <section ref={faqRef} className="py-16 md:py-24 bg-muted/30" aria-label="Frequently asked questions about decision making">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Frequently Asked Questions About Decision Making
              </h2>
              <p className="mt-3 text-muted-foreground">Everything you need to know about making better decisions with AI</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group rounded-lg border border-border/50 bg-card overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
                    {faq.q}
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="py-16 md:py-20" aria-label="Pricing overview">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Simple, Transparent Pricing</h2>
              <p className="mt-3 text-muted-foreground">One good decision can pay for this forever</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { name: 'Free', price: '£0', desc: '5 quick decisions/month', cta: 'Get Started Free', popular: false },
                { name: 'Pro', price: '£9.99/mo', desc: 'Unlimited everything + AI', cta: 'Start 7-Day Free Trial', popular: true },
                { name: 'Lifetime', price: '£99.99', desc: 'Pay once, own forever', cta: 'Best Value — Get Lifetime', popular: false },
              ].map((plan, i) => (
                <Card key={i} className={`p-6 text-center ${plan.popular ? 'border-primary shadow-lg relative' : 'border-border/50'}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Most Popular</Badge>
                  )}
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-2xl font-bold text-foreground mt-2">{plan.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                  <Button 
                    className="w-full mt-4" 
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate(user ? '/pricing' : '/auth')}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-primary/5" aria-label="Start making better decisions">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Only {10 - signupCount} early adopter spots remaining</span>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">
              Your next decision doesn't have to be this hard
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Stop second-guessing. Stop losing sleep. Join thousands making decisions they're proud of — start completely free.
            </p>
            
            <Button 
              size="lg" 
              onClick={handleGetStarted} 
              className="gap-2 text-lg px-10 py-7 group transition-all duration-300 hover:scale-105 shadow-lg"
              aria-label="Start making better decisions now"
            >
              Make your first decision now — free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="mt-6 text-sm text-muted-foreground">
              ✓ No credit card • ✓ 7-day money back guarantee • ✓ Cancel anytime
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                2,000+ users
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                Bank-level encryption
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                4.9/5 rating
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-10 bg-muted/20" role="contentinfo">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Clarity</span>
              </div>
              <p className="text-sm text-muted-foreground">The #1 AI-powered decision making app. Make better decisions with confidence.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="/#demo" className="hover:text-primary transition-colors">Live Demo</a></li>
                <li><a href="/auth" className="hover:text-primary transition-colors">Sign Up Free</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Use Cases</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Career Decision Making</li>
                <li>Financial Decision Analysis</li>
                <li>Relationship Decisions</li>
                <li>Life Decision Framework</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Clarity — AI Decision Making App. Make decisions with confidence.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Index;
