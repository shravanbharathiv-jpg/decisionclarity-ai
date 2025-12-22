-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_payment_status TEXT DEFAULT 'unpaid',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create decisions table
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  current_step INTEGER NOT NULL DEFAULT 1,
  time_horizon TEXT,
  is_reversible TEXT,
  do_nothing_outcome TEXT,
  biggest_fear TEXT,
  future_regret TEXT,
  ai_insight_summary TEXT,
  best_case_scenario TEXT,
  likely_case_scenario TEXT,
  worst_case_scenario TEXT,
  ai_scenario_analysis TEXT,
  detected_biases JSONB,
  ai_bias_explanation TEXT,
  final_decision TEXT,
  decision_summary TEXT,
  key_reasons TEXT,
  risks_accepted TEXT,
  biases_acknowledged TEXT,
  locked_at TIMESTAMP WITH TIME ZONE,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on decisions
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

-- Decisions policies
CREATE POLICY "Users can view their own decisions"
ON public.decisions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decisions"
ON public.decisions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decisions"
ON public.decisions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decisions"
ON public.decisions FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_decisions_updated_at
BEFORE UPDATE ON public.decisions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();