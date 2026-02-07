import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, X, ChevronRight, Sparkles, 
  Brain, Shield, MessageCircle
} from 'lucide-react';

interface ClarityGuideProps {
  onTryDemo?: () => void;
  onGetStarted?: () => void;
}

const tips = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Welcome to Clarity',
    message: "I'm here to help you make better decisions. Most people struggle because they don't have a system—I'll give you one.",
    action: 'Show me how',
  },
  {
    id: 'demo',
    icon: Brain,
    title: 'Try the Demo First',
    message: "Before signing up, try our interactive demo below. Experience how we break down complex decisions into clear steps.",
    action: 'Try the demo',
  },
  {
    id: 'trust',
    icon: Shield,
    title: 'Your Privacy Matters',
    message: "Everything you share is encrypted. We never sell your data. Your decisions are yours alone.",
    action: 'Got it',
  },
];

const ClarityGuide = ({ onTryDemo, onGetStarted }: ClarityGuideProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Show guide after a short delay
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('clarity-guide-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAction = () => {
    setHasInteracted(true);
    
    if (currentTipIndex === 0) {
      // First tip - go to next
      setCurrentTipIndex(1);
    } else if (currentTipIndex === 1) {
      // Demo tip - scroll to demo
      onTryDemo?.();
      setIsMinimized(true);
    } else {
      // Last tip - done
      setIsVisible(false);
      localStorage.setItem('clarity-guide-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('clarity-guide-dismissed', 'true');
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isVisible) return null;

  const currentTip = tips[currentTipIndex];
  const TipIcon = currentTip.icon;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 animate-fade-in">
      {isMinimized ? (
        <Button
          onClick={handleMinimize}
          className="rounded-full w-14 h-14 shadow-lg hover:scale-110 transition-transform bg-primary"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <div className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-[320px] overflow-hidden">
          {/* Header with mascot */}
          <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mascot Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-primary-foreground" />
                </div>
                {/* Animated glow */}
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Clair</p>
                <p className="text-xs text-muted-foreground">Your Decision Guide</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMinimize}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
                aria-label="Minimize"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <TipIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm text-foreground">{currentTip.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentTip.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {tips.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTipIndex
                        ? 'bg-primary'
                        : index < currentTipIndex
                        ? 'bg-primary/40'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button size="sm" onClick={handleAction} className="gap-1.5">
                {currentTip.action}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-500" />
                Private
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                No data sold
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClarityGuide;
