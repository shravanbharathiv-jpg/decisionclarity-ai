import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SummarizeButtonProps {
  content: string;
  onSummaryGenerated: (summary: string) => void;
  className?: string;
}

export const SummarizeButton = ({ content, onSummaryGenerated, className = '' }: SummarizeButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [isSummarized, setIsSummarized] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (isSummarized) {
      // Restore original content
      onSummaryGenerated(originalContent);
      setIsSummarized(false);
      return;
    }

    setLoading(true);
    setOriginalContent(content);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-reflection', {
        body: {
          type: 'summarize',
          content: content,
        },
      });

      if (error) throw error;

      onSummaryGenerated(data.analysis);
      setIsSummarized(true);
      
      toast({
        title: 'Summary generated',
        description: 'Click again to view full content',
      });
    } catch (error: any) {
      console.error('Error summarizing:', error);
      toast({
        title: 'Error generating summary',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!content || content.length < 100) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSummarize}
      disabled={loading}
      className={`gap-2 text-muted-foreground hover:text-foreground ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Summarizing...
        </>
      ) : isSummarized ? (
        <>
          <Maximize2 className="h-3.5 w-3.5" />
          Show Full
        </>
      ) : (
        <>
          <Minimize2 className="h-3.5 w-3.5" />
          Summarize
        </>
      )}
    </Button>
  );
};
