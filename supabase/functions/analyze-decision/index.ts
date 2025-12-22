import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  type: 'insight' | 'scenario' | 'bias';
  decisionTitle: string;
  decisionDescription?: string;
  timeHorizon?: string;
  isReversible?: string;
  doNothingOutcome?: string;
  biggestFear?: string;
  futureRegret?: string;
  bestCase?: string;
  likelyCase?: string;
  worstCase?: string;
  allResponses?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { type, ...data }: AnalysisRequest = await req.json();
    console.log(`[ANALYZE-DECISION] Processing ${type} analysis`);

    let systemPrompt = "";
    let userPrompt = "";

    if (type === 'insight') {
      systemPrompt = `You are an expert decision analyst. Your role is to analyze user responses about a major life decision and provide clear, actionable insights. Be direct, empathetic, and insightful. Focus on patterns, hidden assumptions, and overlooked factors.`;
      
      userPrompt = `Analyze this decision and provide a concise insight summary (2-3 paragraphs max):

Decision: ${data.decisionTitle}
${data.decisionDescription ? `Description: ${data.decisionDescription}` : ''}

User's responses:
- Time horizon: ${data.timeHorizon || 'Not specified'}
- Reversibility: ${data.isReversible || 'Not specified'}
- If they do nothing: ${data.doNothingOutcome || 'Not specified'}
- Biggest fear: ${data.biggestFear || 'Not specified'}
- Future regret concern: ${data.futureRegret || 'Not specified'}

Provide insights about:
1. What patterns or blind spots you notice
2. The actual risk level based on reversibility and time horizon
3. What they might be over-weighting or under-weighting`;
    } else if (type === 'scenario') {
      systemPrompt = `You are an expert scenario analyst. Your role is to analyze three scenarios for a major decision and highlight the asymmetry between outcomes. Be clear and direct.`;
      
      userPrompt = `Analyze these three scenarios for the decision: "${data.decisionTitle}"

Best realistic case: ${data.bestCase || 'Not provided'}
Most likely case: ${data.likelyCase || 'Not provided'}
Worst realistic case: ${data.worstCase || 'Not provided'}

Provide a brief analysis (2-3 paragraphs) that:
1. Summarizes the range of outcomes
2. Highlights any asymmetry (e.g., limited downside with significant upside, or vice versa)
3. Notes what's controllable vs. uncontrollable in these scenarios`;
    } else if (type === 'bias') {
      systemPrompt = `You are a cognitive bias expert. Your role is to detect likely cognitive biases in someone's decision-making process based on their responses. Be calm, non-judgmental, and educational. Focus on the most relevant 2-4 biases.`;
      
      const responses = data.allResponses || {};
      userPrompt = `Based on all the following information about this decision, detect likely cognitive biases:

Decision: ${data.decisionTitle}
${data.decisionDescription ? `Description: ${data.decisionDescription}` : ''}

All user responses:
${Object.entries(responses).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Provide:
1. A list of 2-4 likely biases detected (with brief explanations of how they appear)
2. For each bias, a one-sentence suggestion for how to counter it

Common biases to check for:
- Fear avoidance (avoiding discomfort rather than optimizing outcomes)
- Sunk cost fallacy (overvaluing past investments)
- Status quo bias (preferring current state regardless of merits)
- Overconfidence (underestimating uncertainty)
- Loss aversion (fearing losses more than valuing gains)
- Confirmation bias (seeking confirming evidence)

Format your response with clear headers for each bias.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ANALYZE-DECISION] AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices?.[0]?.message?.content || "Analysis could not be generated.";
    
    console.log("[ANALYZE-DECISION] Analysis generated successfully");

    // For bias detection, also extract bias names as structured data
    let biases: string[] = [];
    if (type === 'bias') {
      const biasPatterns = [
        /fear avoidance/gi,
        /sunk cost/gi,
        /status quo/gi,
        /overconfidence/gi,
        /loss aversion/gi,
        /confirmation bias/gi,
        /anchoring/gi,
        /availability/gi,
        /optimism bias/gi,
        /pessimism bias/gi,
      ];
      
      biasPatterns.forEach(pattern => {
        if (pattern.test(analysis)) {
          const match = analysis.match(pattern);
          if (match) {
            biases.push(match[0].toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()));
          }
        }
      });
    }

    return new Response(JSON.stringify({ 
      analysis,
      biases: biases.length > 0 ? biases : undefined
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[ANALYZE-DECISION] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
