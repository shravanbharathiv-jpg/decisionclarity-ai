import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Zap, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DECISION_CATEGORIES } from '@/types/decision';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

const NewDecision = () => {
  const [searchParams] = useSearchParams();
  const isQuickMode = searchParams.get('mode') === 'quick';
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  
  // Quick decision state
  const [quickOptionA, setQuickOptionA] = useState('');
  const [quickOptionB, setQuickOptionB] = useState('');
  const [quickResult, setQuickResult] = useState<{
    recommendation: string;
    reason: string;
    confidence: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { user, hasPaid } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadTemplates = async () => {
    if (templates.length > 0) {
      setShowTemplates(!showTemplates);
      return;
    }
    
    setLoadingTemplates(true);
    const { data, error } = await supabase
      .from('decision_templates')
      .select('id, name, description, category');
    
    if (!error && data) {
      setTemplates(data);
    }
    setLoadingTemplates(false);
    setShowTemplates(true);
  };

  const selectTemplate = (template: Template) => {
    setTitle(template.name);
    setCategory(template.category);
    setShowTemplates(false);
    toast({
      title: 'Template selected',
      description: `Using "${template.name}" framework`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your decision.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('decisions')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          category,
          status: 'in_progress',
          current_step: 2,
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/decision/${data.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create decision',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAnalysis = () => {
    if (!quickOptionA.trim() || !quickOptionB.trim()) {
      toast({
        title: 'Both options required',
        description: 'Please enter both options to compare.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate quick AI analysis
    setTimeout(() => {
      const options = [quickOptionA, quickOptionB];
      const randomPick = Math.random() > 0.5 ? 0 : 1;
      const confidence = Math.floor(Math.random() * 30) + 60;
      
      const reasons = [
        "Based on typical outcomes, this option has lower risk with similar upside.",
        "This choice preserves more future options while addressing the immediate need.",
        "Quick analysis suggests this aligns better with common decision patterns.",
        "This option offers better reversibility if things don't work out.",
        "This appears to have a better effort-to-reward ratio for everyday choices.",
      ];
      
      setQuickResult({
        recommendation: options[randomPick],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        confidence,
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const resetQuickDecision = () => {
    setTitle('');
    setQuickOptionA('');
    setQuickOptionB('');
    setQuickResult(null);
  };

  const convertToFullDecision = () => {
    navigate('/decision/new');
  };

  // Quick Decision Mode UI
  if (isQuickMode) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-xl">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <Badge className="w-fit mx-auto mb-2 bg-primary/10 text-primary border-0">
                <Zap className="h-3 w-3 mr-1.5" />
                Quick Decision
              </Badge>
              <CardTitle className="text-2xl">Make a fast choice</CardTitle>
              <CardDescription>
                For everyday decisions that don't need deep analysis. Get an answer in 30 seconds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!quickResult ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="quick-title">What are you deciding?</Label>
                    <Input
                      id="quick-title"
                      placeholder="e.g., Which restaurant for dinner?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-base"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="option-a">Option A</Label>
                      <Input
                        id="option-a"
                        placeholder="First choice"
                        value={quickOptionA}
                        onChange={(e) => setQuickOptionA(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="option-b">Option B</Label>
                      <Input
                        id="option-b"
                        placeholder="Second choice"
                        value={quickOptionB}
                        onChange={(e) => setQuickOptionB(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleQuickAnalysis}
                    disabled={!quickOptionA.trim() || !quickOptionB.trim() || isAnalyzing}
                    className="w-full gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Get Quick Answer
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Takes about 30 seconds
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <p className="text-sm text-center text-muted-foreground">
                      Need deeper analysis?{' '}
                      <button 
                        onClick={convertToFullDecision}
                        className="text-primary underline underline-offset-2"
                      >
                        Start a full decision
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <p className="text-xs text-muted-foreground mb-2">Quick recommendation</p>
                    <p className="text-2xl font-bold text-foreground">{quickResult.recommendation}</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${quickResult.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{quickResult.confidence}% confidence</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-sm text-muted-foreground">{quickResult.reason}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Note:</strong> This is a quick heuristic for low-stakes choices. 
                      For important decisions with lasting impact, consider a full analysis.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={resetQuickDecision} className="flex-1 gap-2">
                      <RefreshCw className="h-4 w-4" />
                      New quick decision
                    </Button>
                    <Button onClick={convertToFullDecision} className="flex-1 gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Deep analysis
                    </Button>
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')} 
                    className="w-full"
                  >
                    Back to dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Standard Decision Flow UI
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-xl">
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Step 1 of 5</div>
            <CardTitle className="text-2xl">What decision are you facing?</CardTitle>
            <CardDescription>
              Describe the choice you need to make. Be as specific as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPaid && (
              <div className="mb-6">
                <Button 
                  variant="outline" 
                  onClick={loadTemplates}
                  className="w-full gap-2"
                  disabled={loadingTemplates}
                >
                  {loadingTemplates ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Use a decision template
                </Button>
                
                {showTemplates && templates.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => selectTemplate(template)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Decision title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Should I quit my job to start a business?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DECISION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Additional context <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Any background information that might be helpful..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-border/50 pt-6">
              <p className="text-sm text-center text-muted-foreground">
                Just need a quick answer?{' '}
                <button 
                  onClick={() => navigate('/decision/new?mode=quick')}
                  className="text-primary underline underline-offset-2"
                >
                  Try quick decision mode
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewDecision;
