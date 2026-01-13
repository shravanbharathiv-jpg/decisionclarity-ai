import { useState, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SummarizeButtonProps {
  content: string;
  onSummaryGenerated: (summary: string) => void;
  className?: string;
}

export const SummarizeButton = forwardRef<HTMLButtonElement, SummarizeButtonProps>(
  ({ content, onSummaryGenerated, className = '' }, ref) => {
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
        ref={ref}
        variant="ghost"
        size="sm"
        onClick={handleSummarize}
        disabled={loading}
        className={`gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground h-8 sm:h-9 px-2 sm:px-3 ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
            <span className="hidden xs:inline">Summarizing...</span>
            <span className="xs:hidden">...</span>
          </>
        ) : isSummarized ? (
          <>
            <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Show Full</span>
          </>
        ) : (
          <>
            <Minimize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Summarize</span>
          </>
        )}
      </Button>
    );
  }
);

SummarizeButton.displayName = 'SummarizeButton';
