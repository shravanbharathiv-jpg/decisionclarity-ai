-- Add new fields to decisions table for enhanced features
ALTER TABLE public.decisions 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS outcome text,
ADD COLUMN IF NOT EXISTS confidence_rating integer CHECK (confidence_rating >= 1 AND confidence_rating <= 10),
ADD COLUMN IF NOT EXISTS template_id text,
ADD COLUMN IF NOT EXISTS second_order_effects text,
ADD COLUMN IF NOT EXISTS ai_second_order_analysis text;

-- Create decision_reflections table for 30/90/180 day reflections
CREATE TABLE IF NOT EXISTS public.decision_reflections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id uuid NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reflection_type text NOT NULL CHECK (reflection_type IN ('30_day', '90_day', '180_day')),
  aged_well boolean,
  what_surprised text,
  what_differently text,
  ai_reflection_analysis text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on decision_reflections
ALTER TABLE public.decision_reflections ENABLE ROW LEVEL SECURITY;

-- RLS policies for decision_reflections
CREATE POLICY "Users can view their own reflections" 
ON public.decision_reflections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reflections" 
ON public.decision_reflections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections" 
ON public.decision_reflections 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create bias_profile table for tracking user patterns
CREATE TABLE IF NOT EXISTS public.bias_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  common_biases jsonb DEFAULT '[]'::jsonb,
  risk_tolerance text,
  fear_patterns text,
  overconfidence_patterns text,
  ai_profile_summary text,
  total_decisions_analyzed integer DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on bias_profiles
ALTER TABLE public.bias_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for bias_profiles
CREATE POLICY "Users can view their own bias profile" 
ON public.bias_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bias profile" 
ON public.bias_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bias profile" 
ON public.bias_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create decision_comparisons table for comparing multiple decisions
CREATE TABLE IF NOT EXISTS public.decision_comparisons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  decision_ids uuid[] NOT NULL,
  ai_comparison_analysis text,
  asymmetric_upside text,
  hidden_costs text,
  emotional_bias_differences text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on decision_comparisons
ALTER TABLE public.decision_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS policies for decision_comparisons
CREATE POLICY "Users can view their own comparisons" 
ON public.decision_comparisons 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own comparisons" 
ON public.decision_comparisons 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comparisons" 
ON public.decision_comparisons 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparisons" 
ON public.decision_comparisons 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS decisions_used_this_month integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_decision_reset timestamp with time zone DEFAULT now();

-- Create decision_templates table
CREATE TABLE IF NOT EXISTS public.decision_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  questions jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on decision_templates (read-only for all authenticated users)
ALTER TABLE public.decision_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view templates" 
ON public.decision_templates 
FOR SELECT 
TO authenticated
USING (true);

-- Insert default templates
INSERT INTO public.decision_templates (id, name, description, category, questions) VALUES
('quit-job', 'Quitting Your Job', 'A structured approach to evaluate leaving your current position', 'career', '["What is your current financial runway?", "What is driving the desire to leave?", "What does your ideal next role look like?", "What are you risking by staying?", "What skills or connections might you lose?"]'),
('start-business', 'Starting a Business', 'Framework for evaluating entrepreneurial ventures', 'business', '["What problem does this solve?", "Who will pay for this solution?", "What is your unfair advantage?", "What is your minimum viable test?", "What will you sacrifice to make this work?"]'),
('hire-first-employee', 'Hiring First Employee', 'Evaluate readiness for your first hire', 'business', '["What tasks will this person own completely?", "How long can you fund this role?", "What happens if this hire does not work out?", "Are you ready to manage someone daily?", "What will you stop doing when they join?"]'),
('raise-prices', 'Raising Prices', 'Analyze the implications of increasing your rates', 'business', '["What value do your clients receive?", "What would you lose if 20% of clients left?", "What would you gain from the remaining 80%?", "How will you communicate the change?", "What is your minimum viable price increase?"]'),
('move-cities', 'Moving Cities', 'Evaluate a major location change', 'personal', '["What are you running toward?", "What are you running from?", "Who will you lose access to?", "What opportunities exist there that do not exist here?", "What is your trial period before committing?"]'),
('end-relationship', 'Ending a Relationship', 'A thoughtful approach to relationship decisions', 'relationships', '["What has changed since the beginning?", "What have you tried to fix it?", "What would staying cost you in 5 years?", "What would leaving cost you in 5 years?", "Are you leaving someone or leaving for something?"]')
ON CONFLICT (id) DO NOTHING;