// Use the native Deno.serve() which is standard as of 2025.
// No external standard library import for 'serve' is required.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight Requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { decision } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Analyze this decision and provide a quality score from 0-100:
Decision: ${decision.title}
Description: ${decision.description || 'Not provided'}
Time Horizon: ${decision.time_horizon || 'Not specified'}
Reversibility: ${decision.is_reversible || 'Not specified'}
... (rest of your prompt) ...

Respond ONLY with valid JSON in this format:
{
  "overall_score": number,
  "clarity_score": number,
  "bias_score": number,
  "reversibility_score": number,
  "analysis_depth_score": number,
  "explanation": "string"
}`;

    // 2. Call the AI Gateway (using Gemini 2.5 Flash GA model)
    const response = await fetch("ai.gateway.lovable.dev", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash", // Updated stable model ID for 2025
        messages: [
          { role: "system", content: "You are a decision quality analyst. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`Failed to get AI scoring: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // 3. Robust JSON extraction
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }
    
    const scores = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(scores), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) { 
    // FIX FOR TS18046: Handle 'unknown' type correctly for 2025 TypeScript standards
    console.error('Error in score-decision function:', error);

    // Safely extract the message using a type guard
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
