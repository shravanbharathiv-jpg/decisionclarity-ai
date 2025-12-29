import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Shield, 
  Lightbulb, 
  TrendingUp, 
  ArrowRight, 
  Check,
  Sparkles,
  Crown,
  Zap,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/pricing');
    }
  };

  const handleSkip = () => {
    navigate('/auth');
  };

  const steps: OnboardingStep[] = [
    {
      title: "You're Not Indecisive",
      subtitle: "You're Thoughtful",
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
              The most successful people don't make faster decisions. They make <span className="text-foreground font-medium">better structured</span> decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Clock, text: "Stop overthinking" },
              { icon: Target, text: "Gain clarity" },
              { icon: Shield, text: "Reduce regret" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                <item.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "The Hidden Cost of Bad Decisions",
      subtitle: "What's one unclear choice costing you?",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            {[
              { cost: "£10,000+", label: "Wrong career move", desc: "Years of earning potential lost" },
              { cost: "6+ months", label: "Analysis paralysis", desc: "Opportunities passing you by" },
              { cost: "Priceless", label: "Peace of mind", desc: "Sleepless nights second-guessing" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/50 bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{item.cost}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm">
            One good decision can pay for this tool forever.
          </p>
        </div>
      ),
    },
    {
      title: "How Clarity Works",
      subtitle: "A 5-step system used by elite decision makers",
      content: (
        <div className="space-y-4">
          {[
            { step: 1, icon: Brain, title: "Deconstruct", desc: "Break down your decision into core components" },
            { step: 2, icon: Target, title: "Scenario Model", desc: "Explore best, worst, and likely outcomes", pro: true },
            { step: 3, icon: Shield, title: "Bias Check", desc: "AI detects cognitive blind spots", pro: true },
            { step: 4, icon: TrendingUp, title: "Second-Order Think", desc: "See ripple effects others miss", pro: true },
            { step: 5, icon: Lightbulb, title: "Lock & Commit", desc: "End deliberation, move forward" },
          ].map((item, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                item.pro ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {item.step}
              </div>
              <item.icon className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{item.title}</p>
                  {item.pro && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">PRO</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Revolutionary Features",
      subtitle: "Tools no other decision app offers",
      content: (
        <div className="space-y-4">
          {[
            { 
              icon: BarChart3, 
              title: "AI Decision Scoring", 
              desc: "Get a 0-100 score on your decision quality with detailed breakdown",
              tag: "NEW"
            },
            { 
              icon: Users, 
              title: "Advisor Sharing", 
              desc: "Share decisions with trusted mentors and get their input",
              tag: "NEW"
            },
            { 
              icon: Sparkles, 
              title: "Templates Library", 
              desc: "Pre-built frameworks for career, business, money & life decisions",
              tag: "PRO"
            },
            { 
              icon: TrendingUp, 
              title: "Bias Profile", 
              desc: "Track your decision patterns and cognitive tendencies over time",
              tag: "PRO"
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card">
              <div className="p-2 rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    item.tag === 'NEW' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'
                  }`}>
                    {item.tag}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "People Like You Are Winning",
      subtitle: "Join 1,000+ decision makers using Clarity",
      content: (
        <div className="space-y-6">
          {[
            {
              quote: "I was stuck for 3 months on whether to leave my job. Clarity helped me decide in one evening.",
              author: "Sarah M.",
              role: "Product Manager",
            },
            {
              quote: "The bias detection showed me I was anchored on sunk costs. Saved me from a £50k mistake.",
              author: "James T.",
              role: "Startup Founder",
            },
            {
              quote: "Finally, a tool that matches how my brain works. The structure is everything.",
              author: "Dr. Rachel K.",
              role: "Clinical Psychologist",
            },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm italic text-foreground">"{item.quote}"</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
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
      ),
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Clarity</h1>
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-xl flex flex-col">
        <Progress value={progress} className="h-1 mb-8" />
        
        <Card className="flex-1 border-border/50">
          <CardHeader className="text-center pb-2">
            <CardDescription className="text-xs uppercase tracking-wider text-primary">
              {currentStep + 1} of {steps.length}
            </CardDescription>
            <CardTitle className="text-2xl mt-2">{steps[currentStep].title}</CardTitle>
            <CardDescription className="text-base">
              {steps[currentStep].subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {steps[currentStep].content}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={handleNext} className="gap-2 min-w-[200px]">
            {currentStep === steps.length - 1 ? (
              <>
                See Plans
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
