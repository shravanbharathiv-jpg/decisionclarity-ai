export interface Decision {
  id: string;
  title: string;
  description: string | null;
  status: string;
  current_step: number;
  category: string;
  outcome: string | null;
  confidence_rating: number | null;
  template_id: string | null;
  time_horizon: string | null;
  is_reversible: string | null;
  do_nothing_outcome: string | null;
  biggest_fear: string | null;
  future_regret: string | null;
  ai_insight_summary: string | null;
  best_case_scenario: string | null;
  likely_case_scenario: string | null;
  worst_case_scenario: string | null;
  ai_scenario_analysis: string | null;
  detected_biases: string[] | null;
  ai_bias_explanation: string | null;
  second_order_effects: string | null;
  ai_second_order_analysis: string | null;
  final_decision: string | null;
  decision_summary: string | null;
  key_reasons: string | null;
  risks_accepted: string | null;
  biases_acknowledged: string | null;
  is_locked: boolean;
  locked_at: string | null;
  created_at: string;
}

export interface DecisionReflection {
  id: string;
  decision_id: string;
  user_id: string;
  reflection_type: '30_day' | '90_day' | '180_day';
  aged_well: boolean | null;
  what_surprised: string | null;
  what_differently: string | null;
  ai_reflection_analysis: string | null;
  created_at: string;
}

export interface BiasProfile {
  id: string;
  user_id: string;
  common_biases: string[];
  risk_tolerance: string | null;
  fear_patterns: string | null;
  overconfidence_patterns: string | null;
  ai_profile_summary: string | null;
  total_decisions_analyzed: number;
  updated_at: string;
  created_at: string;
}

export interface DecisionComparison {
  id: string;
  user_id: string;
  title: string;
  decision_ids: string[];
  ai_comparison_analysis: string | null;
  asymmetric_upside: string | null;
  hidden_costs: string | null;
  emotional_bias_differences: string | null;
  created_at: string;
  updated_at: string;
}

export interface DecisionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: string[];
  created_at: string;
}

export const DECISION_CATEGORIES = [
  { value: 'career', label: 'Career' },
  { value: 'business', label: 'Business' },
  { value: 'money', label: 'Money' },
  { value: 'personal', label: 'Personal' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'general', label: 'General' },
] as const;

export type DecisionCategory = typeof DECISION_CATEGORIES[number]['value'];
