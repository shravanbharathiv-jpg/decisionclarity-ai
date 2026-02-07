import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, ArrowRight, CheckCircle, 
  RefreshCw, Sparkles, Clock
} from 'lucide-react';

interface QuickDecision {
  decision: string;
  optionA: string;
  optionB: string;
}

const quickPrompts = [
  "Which should I choose?",
  "What's the quick answer?",
  "Help me decide fast",
];

const QuickDecisionWidget = () => {
  const [step, setStep] = useState<'input' | 'options' | 'result'>('input');
  const [decision, setDecision] = useState<QuickDecision>({
    decision: '',
    optionA: '',
    optionB: '',
  });
  const [result, setResult] = useState<{
    recommendation: string;
    reason: string;
    confidence: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleQuickAnalysis = () => {
    if (!decision.optionA.trim() || !decision.optionB.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate quick AI analysis
    setTimeout(() => {
      const options = [decision.optionA, decision.optionB];
      const randomPick = Math.random() > 0.5 ? 0 : 1;
      const confidence = Math.floor(Math.random() * 30) + 60; // 60-90%
      
      const reasons = [
        "Based on typical outcomes, this option has lower risk with similar upside.",
        "This choice preserves more future options while addressing the immediate need.",
        "Quick analysis suggests this aligns better with common decision patterns.",
        "This option offers better reversibility if things don't work out.",
      ];
      
      setResult({
        recommendation: options[randomPick],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        confidence,
      });
      setIsAnalyzing(false);
      setStep('result');
    }, 1500);
  };

  const reset = () => {
    setStep('input');
    setDecision({ decision: '', optionA: '', optionB: '' });
    setResult(null);
  };

  return (
    <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Quick Decision</h3>
          <p className="text-xs text-muted-foreground">For everyday choices • 30 seconds</p>
        </div>
        <Badge variant="outline" className="ml-auto text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Fast
        </Badge>
      </div>

      {step === 'input' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              What are you deciding between?
            </label>
            <Input
              placeholder="e.g., pizza or sushi for dinner"
              value={decision.decision}
              onChange={(e) => setDecision({ ...decision, decision: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Option A
              </label>
              <Input
                placeholder="First choice"
                value={decision.optionA}
                onChange={(e) => setDecision({ ...decision, optionA: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Option B
              </label>
              <Input
                placeholder="Second choice"
                value={decision.optionB}
                onChange={(e) => setDecision({ ...decision, optionB: e.target.value })}
              />
            </div>
          </div>

          <Button 
            onClick={() => {
              if (decision.optionA.trim() && decision.optionB.trim()) {
                setStep('options');
                handleQuickAnalysis();
              }
            }}
            disabled={!decision.optionA.trim() || !decision.optionB.trim()}
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Quick Analysis
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            For low-stakes decisions. Need depth?{' '}
            <a href="/decision/new" className="text-primary underline underline-offset-2">
              Start a full analysis
            </a>
          </p>
        </div>
      )}

      {step === 'options' && isAnalyzing && (
        <div className="py-8 text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Analyzing your options...</p>
          <div className="flex justify-center gap-1 mt-3">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-xs text-muted-foreground mb-2">Quick recommendation</p>
            <p className="text-xl font-bold text-foreground">{result.recommendation}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{result.confidence}% confidence</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-sm text-muted-foreground">{result.reason}</p>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Note:</strong> This is a quick heuristic for low-stakes choices. 
              For important decisions, use our full decision framework.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={reset} className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              New decision
            </Button>
            <Button onClick={() => window.location.href = '/decision/new'} className="flex-1 gap-2">
              <ArrowRight className="h-4 w-4" />
              Deep analysis
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuickDecisionWidget;
