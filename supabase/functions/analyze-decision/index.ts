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
      console.error("Configuration Error: LOVABLE_API_KEY is missing from environment variables.");
      throw new Error("Server configuration error: API Key missing.");
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      throw new Error("Invalid JSON in request body");
    }

    const { type, ...data }: AnalysisRequest = body;
    console.log(`[${new Date().toISOString()}] Processing ${type} analysis for: ${data.decisionTitle}`);

    let systemPrompt = "";
    let userPrompt = "";

    if (type === 'insight') {
      systemPrompt = `You are an expert decision analyst. Provide clear, actionable insights. Focus on patterns and hidden assumptions.`;
      userPrompt = `Analyze this decision: "${data.decisionTitle}"\nDescription: ${data.decisionDescription || 'N/A'}\n\nResponses:\n- Horizon: ${data.timeHorizon}\n- Reversibility: ${data.isReversible}\n- Fear: ${data.biggestFear}\n\nProvide 2-3 paragraphs of insight.`;
    } else if (type === 'scenario') {
      systemPrompt = `You are an expert scenario analyst focusing on outcome asymmetry.`;
      userPrompt = `Analyze these scenarios for "${data.decisionTitle}":\nBest: ${data.bestCase}\nLikely: ${data.likelyCase}\nWorst: ${data.worstCase}\n\nHighlight the risk/reward balance.`;
    } else if (type === 'bias') {
      systemPrompt = `You are a cognitive bias expert. Detect 2-4 biases and provide counter-strategies.`;
      const responses = data.allResponses || {};
      const responseText = Object.entries(responses).map(([k, v]) => `${k}: ${v}`).join('\n');
      userPrompt = `Detect biases in this data:\n${responseText}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[AI GATEWAY ERROR] Status: ${response.status}`, errorData);

      const statusMap: Record<number, string> = {
        429: "The AI service is currently rate-limited. Please wait a moment.",
        401: "AI Authentication failed. Check your API keys.",
        402: "AI service quota exceeded.",
        503: "AI Gateway is currently down."
      };

      throw new Error(statusMap[response.status] || `AI Gateway responded with ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error("AI returned an empty response.");
    }

    let biases: string[] = [];
    if (type === 'bias') {
      const commonBiases = ["Fear avoidance", "Sunk cost", "Status quo", "Overconfidence", "Loss aversion", "Confirmation bias"];
      biases = commonBiases.filter(b => new RegExp(b, "gi").test(analysis));
    }

    return new Response(JSON.stringify({ analysis, biases: biases.length > 0 ? biases : undefined }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[RUNTIME ERROR]", error.message);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
