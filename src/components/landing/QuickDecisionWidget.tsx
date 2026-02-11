import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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

const QuickDecisionWidget = () => {
  const [step, setStep] = useState<'input' | 'options' | 'result'>('input');
  const [decision, setDecision] = useState<QuickDecision>({
    decision: '',
    optionA: '',
    optionB: '',
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartAnalysis = () => {
    if (!decision.optionA.trim() || !decision.optionB.trim()) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // User is logged in, redirect to quick decision mode in dashboard
    navigate('/decision/new?mode=quick');
  };

  const reset = () => {
    setStep('input');
    setDecision({ decision: '', optionA: '', optionB: '' });
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
          onClick={handleStartAnalysis}
          disabled={!decision.optionA.trim() || !decision.optionB.trim()}
          className="w-full gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {user ? 'Quick Analysis' : 'Sign up to analyze'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {user ? (
            <>For low-stakes decisions. Need depth? <a href="/decision/new" className="text-primary underline underline-offset-2">Start a full analysis</a></>
          ) : (
            <>Sign up free to get AI-powered analysis</>
          )}
        </p>
      </div>
    </Card>
  );
};

export default QuickDecisionWidget;
