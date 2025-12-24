import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReflectionRequest {
  type: 'reflection' | 'comparison' | 'second_order' | 'bias_profile';
  decisionTitle?: string;
  originalDecision?: string;
  originalReasoning?: string;
  agedWell?: boolean;
  whatSurprised?: string;
  whatDifferently?: string;
  reflectionType?: string;
  // For comparison
  decisions?: Array<{
    title: string;
    description: string;
    finalDecision: string;
    category: string;
  }>;
  // For second order
  currentContext?: string;
  // For bias profile
  allBiases?: string[];
  decisionPatterns?: any;
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

    const { type, ...data }: ReflectionRequest = await req.json();
    console.log(`[ANALYZE-REFLECTION] Processing ${type} analysis`);

    let systemPrompt = "";
    let userPrompt = "";

    if (type === 'reflection') {
      systemPrompt = `You are a thoughtful analyst helping someone reflect on a past decision. Be calm, insightful, and help them extract learning. Do not motivate or praise. Simply observe and clarify.`;
      
      userPrompt = `Analyze this decision reflection:

Decision: ${data.decisionTitle}
Original decision: ${data.originalDecision}
Original reasoning: ${data.originalReasoning}
Time since decision: ${data.reflectionType?.replace('_', ' ')}
Did it age well: ${data.agedWell ? 'Yes' : 'No'}
What surprised them: ${data.whatSurprised || 'Not provided'}
What they would do differently: ${data.whatDifferently || 'Not provided'}

Provide a brief reflection analysis (2 paragraphs max) that:
1. Identifies what they learned about their decision-making
2. Notes any patterns worth watching in future decisions

Be direct and insightful, not motivational.`;
    } else if (type === 'comparison') {
      systemPrompt = `You are an expert at comparing decisions to reveal hidden trade-offs. Be analytical and direct. Highlight asymmetries and opportunity costs.`;
      
      const decisionsText = data.decisions?.map((d, i) => 
        `Option ${String.fromCharCode(65 + i)}: ${d.title}\nCategory: ${d.category}\nDescription: ${d.description}\nDecision: ${d.finalDecision}`
      ).join('\n\n') || 'No decisions provided';
      
      userPrompt = `Compare these decisions to identify trade-offs:

${decisionsText}

Provide analysis (3 paragraphs max) covering:
1. Asymmetric upside: Which option has the best risk/reward ratio?
2. Hidden opportunity costs: What does choosing one preclude?
3. Emotional bias differences: Are some options being evaluated more emotionally than others?

Be direct and analytical.`;
    } else if (type === 'second_order') {
      systemPrompt = `You are an expert in second-order thinking. Help people see what decisions make easier or harder later. Be direct and insightful.`;
      
      userPrompt = `Analyze the second-order effects of this decision:

Decision: ${data.decisionTitle}
Context: ${data.currentContext || 'Not provided'}

Analyze (2-3 paragraphs):
1. What does this decision make easier later?
2. What doors does this close?
3. What habits or patterns does this reinforce?

Focus on effects that are not immediately obvious.`;
    } else if (type === 'bias_profile') {
      systemPrompt = `You are building a private bias profile based on decision patterns. Be observational, not judgmental. Present insights as observations, not scores.`;
      
      userPrompt = `Based on this user's decision history, identify patterns:

All detected biases across decisions: ${data.allBiases?.join(', ') || 'None recorded'}
Decision patterns: ${JSON.stringify(data.decisionPatterns) || 'No patterns yet'}

Provide insights (3-4 sentences max) in this format:
- Common biases: [list the 2-3 most frequent]
- Risk tolerance: [observation about their risk approach]
- Pattern to watch: [one specific pattern, e.g., "You tend to avoid decisions with short-term discomfort even when long-term upside is high."]

Present as observations, not judgments.`;
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
      console.error("[ANALYZE-REFLECTION] AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices?.[0]?.message?.content || "Analysis could not be generated.";
    
    console.log("[ANALYZE-REFLECTION] Analysis generated successfully");

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[ANALYZE-REFLECTION] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
