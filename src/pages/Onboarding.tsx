import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Target, 
  Shield, 
  Lightbulb, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Crown,
  Zap,
  Clock,
  Users,
  BarChart3,
  Heart,
  Briefcase,
  DollarSign,
  Home
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

interface SurveyAnswers {
  struggleArea: string;
  decisionFrequency: string;
  biggestChallenge: string;
  goalOutcome: string;
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswers>({
    struggleArea: '',
    decisionFrequency: '',
    biggestChallenge: '',
    goalOutcome: '',
  });
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Store survey answers for personalization
      localStorage.setItem('onboardingSurvey', JSON.stringify(surveyAnswers));
      navigate('/pricing');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/auth');
  };

  const updateSurvey = (key: keyof SurveyAnswers, value: string) => {
    setSurveyAnswers(prev => ({ ...prev, [key]: value }));
  };

  const surveyQuestions = [
    {
      key: 'struggleArea' as const,
      question: "What type of decisions do you struggle with most?",
      options: [
        { value: 'career', label: 'Career & Work', icon: Briefcase, desc: 'Job changes, promotions, projects' },
        { value: 'money', label: 'Money & Finance', icon: DollarSign, desc: 'Investments, purchases, savings' },
        { value: 'relationships', label: 'Relationships', icon: Heart, desc: 'Family, friends, partners' },
        { value: 'life', label: 'Life Changes', icon: Home, desc: 'Moving, health, lifestyle' },
      ]
    },
    {
      key: 'decisionFrequency' as const,
      question: "How often do you face difficult decisions?",
      options: [
        { value: 'daily', label: 'Daily', desc: 'I face tough choices every day' },
        { value: 'weekly', label: 'Weekly', desc: 'A few times each week' },
        { value: 'monthly', label: 'Monthly', desc: 'A few big ones each month' },
        { value: 'rarely', label: 'Rarely', desc: 'Only occasionally, but they\'re major' },
      ]
    },
    {
      key: 'biggestChallenge' as const,
      question: "What's your biggest decision-making challenge?",
      options: [
        { value: 'overthinking', label: 'Overthinking', desc: 'I analyze endlessly and can\'t commit' },
        { value: 'fear', label: 'Fear of regret', desc: 'Worried I\'ll make the wrong choice' },
        { value: 'clarity', label: 'Lack of clarity', desc: 'Don\'t know what I really want' },
        { value: 'confidence', label: 'Low confidence', desc: 'Second-guess myself constantly' },
      ]
    },
    {
      key: 'goalOutcome' as const,
      question: "What would success look like for you?",
      options: [
        { value: 'faster', label: 'Faster decisions', desc: 'Stop wasting time deliberating' },
        { value: 'confident', label: 'More confidence', desc: 'Trust my judgment more' },
        { value: 'clarity', label: 'Better clarity', desc: 'Understand what I truly want' },
        { value: 'results', label: 'Better outcomes', desc: 'Make choices I won\'t regret' },
      ]
    },
  ];

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
    // Survey questions
    ...surveyQuestions.map((q) => ({
      title: q.question,
      subtitle: "Help us personalize your experience",
      content: (
        <div className="space-y-4">
          <RadioGroup
            value={surveyAnswers[q.key]}
            onValueChange={(value) => updateSurvey(q.key, value)}
            className="space-y-3"
          >
            {q.options.map((option) => (
              <div key={option.value}>
                <Label
                  htmlFor={option.value}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    surveyAnswers[q.key] === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {'icon' in option && option.icon && <option.icon className="h-4 w-4 text-primary" />}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ),
    })),
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
            { step: 5, icon: Lightbulb, title: "AI Recommendation", desc: "Get a clear recommendation before you decide", pro: true },
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
              icon: Sparkles, 
              title: "AI Recommendation", 
              desc: "Get a clear recommendation before you lock in your decision",
              tag: "NEW"
            },
            { 
              icon: TrendingUp, 
              title: "Long-term Reflections", 
              desc: "Revisit decisions at 30, 90, 180 days to learn from outcomes",
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
              quote: "The AI recommendation gave me the confidence to finally commit. Best £10 I've spent.",
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
  const isSurveyStep = currentStep >= 1 && currentStep <= 4;
  const currentSurveyKey = isSurveyStep ? surveyQuestions[currentStep - 1]?.key : null;
  const canProceed = !isSurveyStep || (currentSurveyKey && surveyAnswers[currentSurveyKey]);

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

        <div className="mt-8 flex justify-center gap-3">
          {currentStep > 0 && (
            <Button variant="outline" size="lg" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button 
            size="lg" 
            onClick={handleNext} 
            className="gap-2 min-w-[200px]"
            disabled={!canProceed}
          >
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
