import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { decision } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Analyze this decision and provide a quality score from 0-100 for each dimension:

Decision: ${decision.title}
Description: ${decision.description || 'Not provided'}
Time Horizon: ${decision.time_horizon || 'Not specified'}
Reversibility: ${decision.is_reversible || 'Not specified'}
Best Case: ${decision.best_case_scenario || 'Not analyzed'}
Worst Case: ${decision.worst_case_scenario || 'Not analyzed'}
Likely Case: ${decision.likely_case_scenario || 'Not analyzed'}
Detected Biases: ${JSON.stringify(decision.detected_biases) || 'None detected'}
Second Order Effects: ${decision.second_order_effects || 'Not analyzed'}

Score these dimensions (0-100):
1. overall_score: Overall decision quality
2. clarity_score: How clearly defined is the decision
3. bias_score: How well biases were identified and addressed (higher = better awareness)
4. reversibility_score: Risk assessment based on reversibility
5. analysis_depth_score: How thorough was the analysis

Respond ONLY with valid JSON in this format:
{
  "overall_score": number,
  "clarity_score": number,
  "bias_score": number,
  "reversibility_score": number,
  "analysis_depth_score": number,
  "explanation": "2-3 sentence explanation of the scores"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a decision quality analyst. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error("Failed to get AI scoring");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response");
    }
    
    const scores = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(scores), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in score-decision function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
