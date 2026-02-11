import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Brain, Sparkles, Shield, Lock, ArrowRight, ArrowLeft, 
  CheckCircle, AlertTriangle, TrendingUp, Lightbulb,
  Play, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type DemoStep = 'start' | 'deconstruct' | 'scenarios' | 'biases' | 'result';

interface DemoData {
  decision: string;
  timeHorizon: string;
  biggestFear: string;
  bestCase: string;
  worstCase: string;
}

const sampleDecisions = [
  { emoji: '💼', text: 'Should I quit my job for a startup?' },
  { emoji: '🏠', text: 'Should I buy a house now or wait?' },
  { emoji: '🎓', text: 'Should I go back to school?' },
];

const detectedBiases = [
  { name: 'Loss Aversion', description: 'Overweighting potential losses vs. gains' },
  { name: 'Status Quo Bias', description: 'Preferring things to stay the same' },
  { name: 'Optimism Bias', description: 'Underestimating risks and challenges' },
];

const LiveDecisionDemo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<DemoStep>('start');
  const [demoData, setDemoData] = useState<DemoData>({
    decision: '',
    timeHorizon: '1 year',
    biggestFear: '',
    bestCase: '',
    worstCase: '',
  });
  const [isTyping, setIsTyping] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);

  const handleSelectSample = (text: string) => {
    setDemoData({ ...demoData, decision: text });
    setTimeout(() => setCurrentStep('deconstruct'), 500);
  };

  const handleCustomDecision = () => {
    if (demoData.decision.trim().length > 10) {
      setCurrentStep('deconstruct');
    }
  };

  const simulateAI = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setShowAIResponse(true);
    }, 1500);
  };

  const goToScenarios = () => {
    if (demoData.biggestFear.trim()) {
      setCurrentStep('scenarios');
    }
  };

  const goToBiases = () => {
    if (demoData.bestCase.trim() && demoData.worstCase.trim()) {
      setShowAIResponse(false);
      setCurrentStep('biases');
      simulateAI();
    }
  };

  const goToResult = () => {
    setCurrentStep('result');
  };

  const resetDemo = () => {
    setCurrentStep('start');
    setDemoData({
      decision: '',
      timeHorizon: '1 year',
      biggestFear: '',
      bestCase: '',
      worstCase: '',
    });
    setShowAIResponse(false);
  };

  const handleGetStarted = () => {
    navigate(user ? '/decision/new' : '/auth');
  };

  const stepIndicators = [
    { key: 'deconstruct', icon: Brain, label: 'Deconstruct' },
    { key: 'scenarios', icon: Sparkles, label: 'Scenarios' },
    { key: 'biases', icon: Shield, label: 'Bias Check' },
    { key: 'result', icon: Lock, label: 'Results' },
  ];

  const getStepIndex = () => {
    const steps: DemoStep[] = ['start', 'deconstruct', 'scenarios', 'biases', 'result'];
    return steps.indexOf(currentStep);
  };

  return (
    <Card className="p-6 md:p-8 border-primary/20 bg-card overflow-hidden relative">
      {/* Step Progress */}
      {currentStep !== 'start' && (
        <div className="flex items-center justify-between mb-8 px-2">
          {stepIndicators.map((step, index) => {
            const isActive = getStepIndex() > index || currentStep === step.key;
            const isCurrent = currentStep === step.key;
            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-primary text-primary-foreground scale-110' 
                    : isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors ${
                  isCurrent ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {index < stepIndicators.length - 1 && (
                  <div className={`absolute h-0.5 w-[calc(25%-2rem)] transition-colors duration-300 ${
                    getStepIndex() > index + 1 ? 'bg-primary/40' : 'bg-muted'
                  }`} style={{ left: `calc(${(index + 1) * 25}% - 1rem)`, top: '2.75rem' }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Start Step */}
      {currentStep === 'start' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <Badge className="mb-3 bg-primary/10 text-primary border-0">
              <Play className="h-3 w-3 mr-1.5" />
              Interactive Demo
            </Badge>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              Try it now—no signup required
            </h3>
            <p className="text-muted-foreground mt-2">
              Choose a sample decision or enter your own
            </p>
          </div>

          <div className="grid gap-3">
            {sampleDecisions.map((decision, i) => (
              <button
                key={i}
                onClick={() => handleSelectSample(decision.text)}
                className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <span className="text-2xl">{decision.emoji}</span>
                <span className="flex-1 font-medium text-foreground group-hover:text-primary transition-colors">
                  {decision.text}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or enter your own</span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="What decision are you facing?"
              value={demoData.decision}
              onChange={(e) => setDemoData({ ...demoData, decision: e.target.value })}
              className="text-base"
            />
            <Button 
              onClick={handleCustomDecision}
              disabled={demoData.decision.trim().length <= 10}
              className="w-full gap-2"
            >
              Start Analysis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Deconstruct Step */}
      {currentStep === 'deconstruct' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">
              <Brain className="h-3 w-3 mr-1.5" />
              Step 1: Deconstruct
            </Badge>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              "{demoData.decision}"
            </h3>
            <p className="text-sm text-muted-foreground">
              Let's break this decision down into manageable pieces
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                What's your biggest fear about this decision?
              </label>
              <Textarea
                placeholder="e.g., I'm afraid of failing and losing my financial security..."
                value={demoData.biggestFear}
                onChange={(e) => setDemoData({ ...demoData, biggestFear: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Time horizon for this decision
              </label>
              <div className="flex gap-2 flex-wrap">
                {['6 months', '1 year', '3 years', '5+ years'].map((horizon) => (
                  <button
                    key={horizon}
                    onClick={() => setDemoData({ ...demoData, timeHorizon: horizon })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      demoData.timeHorizon === horizon
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {horizon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetDemo} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={goToScenarios}
              disabled={!demoData.biggestFear.trim()}
              className="flex-1 gap-2"
            >
              Continue to Scenarios
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Scenarios Step */}
      {currentStep === 'scenarios' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">
              <Sparkles className="h-3 w-3 mr-1.5" />
              Step 2: Scenario Modeling
            </Badge>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Explore the possibilities
            </h3>
            <p className="text-sm text-muted-foreground">
              Our AI will analyze these to give you a complete picture
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
                Best case scenario
              </label>
              <Textarea
                placeholder="If everything goes right, what does success look like?"
                value={demoData.bestCase}
                onChange={(e) => setDemoData({ ...demoData, bestCase: e.target.value })}
                className="min-h-[60px] resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                </div>
                Worst case scenario
              </label>
              <Textarea
                placeholder="What's the worst that could realistically happen?"
                value={demoData.worstCase}
                onChange={(e) => setDemoData({ ...demoData, worstCase: e.target.value })}
                className="min-h-[60px] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentStep('deconstruct')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={goToBiases}
              disabled={!demoData.bestCase.trim() || !demoData.worstCase.trim()}
              className="flex-1 gap-2"
            >
              Analyze with AI
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Biases Step */}
      {currentStep === 'biases' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">
              <Shield className="h-3 w-3 mr-1.5" />
              Step 3: Bias Detection
            </Badge>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              AI is analyzing your thinking patterns...
            </h3>
          </div>

          {isTyping && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground">Detecting cognitive biases...</span>
            </div>
          )}

          {showAIResponse && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Detected Biases</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on your responses, we've identified patterns that might be affecting your judgment:
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {detectedBiases.map((bias, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-sm">{bias.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{bias.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setCurrentStep('scenarios')} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={goToResult} className="flex-1 gap-2">
                  See Your Results
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result Step */}
      {currentStep === 'result' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <Badge className="mb-3 bg-green-500/10 text-green-500 border-0">
              Demo Complete
            </Badge>
            <h3 className="text-xl font-bold text-foreground">
              You just experienced 30% of Clarity
            </h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              The full version includes AI-powered second-order thinking, personalized bias profiles, 
              decision journaling, and the commitment lock that ends deliberation for good.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-sm text-center text-muted-foreground">
              Your demo decision: <span className="text-foreground font-medium">"{demoData.decision}"</span>
            </p>
          </div>

          <div className="grid gap-3">
            <Button onClick={handleGetStarted} size="lg" className="w-full gap-2 py-6">
              Start Your First Real Decision—Free
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={resetDemo} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Another Demo
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              Private & encrypted
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default LiveDecisionDemo;
