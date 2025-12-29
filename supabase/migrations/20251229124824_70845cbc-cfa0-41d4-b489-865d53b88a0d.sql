-- Create table for decision sharing with advisors
CREATE TABLE public.decision_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  advisor_email TEXT NOT NULL,
  advisor_name TEXT,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  can_comment BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create table for advisor comments
CREATE TABLE public.advisor_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id UUID NOT NULL REFERENCES public.decision_shares(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  advisor_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for decision scores (AI scoring)
CREATE TABLE public.decision_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE UNIQUE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  clarity_score INTEGER CHECK (clarity_score >= 0 AND clarity_score <= 100),
  bias_score INTEGER CHECK (bias_score >= 0 AND bias_score <= 100),
  reversibility_score INTEGER CHECK (reversibility_score >= 0 AND reversibility_score <= 100),
  analysis_depth_score INTEGER CHECK (analysis_depth_score >= 0 AND analysis_depth_score <= 100),
  ai_score_explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.decision_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for decision_shares
CREATE POLICY "Users can view their own shares" 
ON public.decision_shares 
FOR SELECT 
USING (auth.uid() = shared_by);

CREATE POLICY "Users can create shares for their decisions" 
ON public.decision_shares 
FOR INSERT 
WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can delete their own shares" 
ON public.decision_shares 
FOR DELETE 
USING (auth.uid() = shared_by);

-- RLS policies for advisor_comments
CREATE POLICY "Decision owners can view comments" 
ON public.advisor_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.decisions d 
    WHERE d.id = decision_id AND d.user_id = auth.uid()
  )
);

-- RLS policies for decision_scores
CREATE POLICY "Users can view their own decision scores" 
ON public.decision_scores 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.decisions d 
    WHERE d.id = decision_id AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert scores for their decisions" 
ON public.decision_scores 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.decisions d 
    WHERE d.id = decision_id AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own decision scores" 
ON public.decision_scores 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.decisions d 
    WHERE d.id = decision_id AND d.user_id = auth.uid()
  )
);

-- Create trigger for decision_scores updated_at
CREATE TRIGGER update_decision_scores_updated_at
BEFORE UPDATE ON public.decision_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();