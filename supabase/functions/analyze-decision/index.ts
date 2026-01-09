import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  type: 'insight' | 'scenario' | 'bias' | 'recommendation';
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
  secondOrderEffects?: string;
  detectedBiases?: string[];
}

// Groq API keys for fallback (compound model)
const GROQ_KEYS = [
  'GROQ_API_KEY_1',
  'GROQ_API_KEY_2', 
  'GROQ_API_KEY_3',
  'GROQ_API_KEY_4',
  'GROQ_API_KEY_5',
];

async function callLovableAI(systemPrompt: string, userPrompt: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
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
    const status = response.status;
    if (status === 429 || status === 402 || status === 503) {
      throw new Error(`LOVABLE_RATE_LIMITED:${status}`);
    }
    throw new Error(`Lovable AI error: ${status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGroqAI(systemPrompt: string, userPrompt: string, keyIndex: number): Promise<string> {
  const keyName = GROQ_KEYS[keyIndex];
  const apiKey = Deno.env.get(keyName);
  
  if (!apiKey) {
    throw new Error(`${keyName} not configured`);
  }

  console.log(`[ANALYZE-DECISION] Trying Groq key ${keyIndex + 1}/5`);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "compound-beta",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429 || status === 402) {
      throw new Error(`GROQ_RATE_LIMITED:${keyIndex}`);
    }
    const errorText = await response.text();
    throw new Error(`Groq error: ${status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function getAIResponse(systemPrompt: string, userPrompt: string): Promise<string> {
  // Try Lovable AI first
  try {
    console.log("[ANALYZE-DECISION] Trying Lovable AI...");
    const result = await callLovableAI(systemPrompt, userPrompt);
    console.log("[ANALYZE-DECISION] Lovable AI succeeded");
    return result;
  } catch (error: any) {
    console.log("[ANALYZE-DECISION] Lovable AI failed:", error.message);
    console.log("[ANALYZE-DECISION] Switching to Groq fallback...");
    
    // Try each Groq key in sequence on ANY Lovable AI failure
    for (let i = 0; i < GROQ_KEYS.length; i++) {
      try {
        const result = await callGroqAI(systemPrompt, userPrompt, i);
        console.log(`[ANALYZE-DECISION] Groq key ${i + 1} succeeded`);
        return result;
      } catch (groqError: any) {
        console.log(`[ANALYZE-DECISION] Groq key ${i + 1} failed:`, groqError.message);
        // Continue to next key on any error
        if (i === GROQ_KEYS.length - 1) {
          throw new Error("All AI providers exhausted. Please try again later.");
        }
      }
    }
    
    throw new Error("All AI providers exhausted. Please try again later.");
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      throw new Error("Invalid JSON in request body");
    }

    const { type, ...data }: AnalysisRequest = body;
    
    // Validate required fields
    if (!type) {
      throw new Error("Analysis type is required");
    }
    if (!data.decisionTitle || data.decisionTitle.trim() === '') {
      throw new Error("Decision title is required");
    }
    
    console.log(`[ANALYZE-DECISION] Processing ${type} analysis for: ${data.decisionTitle}`);

    let systemPrompt = "";
    let userPrompt = "";

    if (type === 'insight') {
      systemPrompt = `You are an expert decision analyst. Provide clear, actionable insights in a friendly, conversational tone. Focus on patterns and hidden assumptions. Format with bullet points for key insights.`;
      userPrompt = `Analyze this decision: "${data.decisionTitle}"
Description: ${data.decisionDescription || 'N/A'}

User's answers:
- Time horizon: ${data.timeHorizon || 'Not specified'}
- Reversibility: ${data.isReversible || 'Not specified'}
- Biggest fear: ${data.biggestFear || 'Not specified'}
- Future regret: ${data.futureRegret || 'Not specified'}

Provide 3-4 key insights as bullet points, each 1-2 sentences. Be direct and practical.`;
    } else if (type === 'scenario') {
      systemPrompt = `You are an expert scenario analyst. Analyze outcomes with clear probability assessments. Be direct and practical. Use bullet points.`;
      userPrompt = `Analyze these scenarios for "${data.decisionTitle}":

Best case: ${data.bestCase || 'Not provided'}
Most likely: ${data.likelyCase || 'Not provided'}  
Worst case: ${data.worstCase || 'Not provided'}

Provide:
1. Probability assessment for each scenario (Low/Medium/High likelihood)
2. Risk/reward analysis in 2-3 bullet points
3. One key insight about the decision's asymmetry`;
    } else if (type === 'bias') {
      systemPrompt = `You are a cognitive bias expert. Detect biases and provide specific counter-strategies. Be constructive, not judgmental. Format with clear sections.`;
      const responses = data.allResponses || {};
      const responseText = Object.entries(responses).map(([k, v]) => `${k}: ${v}`).join('\n');
      userPrompt = `Detect cognitive biases in this decision data:

Decision: ${data.decisionTitle}
${responseText}

For each bias detected:
1. Name the bias
2. Evidence from their responses  
3. One specific counter-strategy

Limit to 2-4 most relevant biases.`;
    } else if (type === 'recommendation') {
      systemPrompt = `You are a trusted decision advisor. Based on all the analysis, provide a clear recommendation. Be direct but acknowledge uncertainty. Format with clear structure.`;
      userPrompt = `Based on this complete decision analysis, provide your recommendation:

Decision: ${data.decisionTitle}
Description: ${data.decisionDescription || 'N/A'}

Scenarios analyzed:
- Best case: ${data.bestCase || 'N/A'}
- Most likely: ${data.likelyCase || 'N/A'}
- Worst case: ${data.worstCase || 'N/A'}

Detected biases: ${data.detectedBiases?.join(', ') || 'None identified'}
Second-order effects: ${data.secondOrderEffects || 'Not analyzed'}

Provide:
1. Your recommendation (1-2 sentences, clear stance)
2. Confidence level (High/Medium/Low) with reasoning
3. Key factor that tips the scales
4. One thing to watch out for after deciding`;
    }

    const analysis = await getAIResponse(systemPrompt, userPrompt);

    if (!analysis) {
      throw new Error("AI returned an empty response.");
    }

    let biases: string[] = [];
    if (type === 'bias') {
      const commonBiases = [
        "Confirmation bias", "Sunk cost fallacy", "Status quo bias", 
        "Overconfidence", "Loss aversion", "Anchoring", 
        "Availability heuristic", "Fear avoidance", "Optimism bias",
        "Recency bias", "Bandwagon effect"
      ];
      biases = commonBiases.filter(b => new RegExp(b, "gi").test(analysis));
    }

    return new Response(JSON.stringify({ 
      analysis, 
      biases: biases.length > 0 ? biases : undefined,
      provider: 'ai'
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[ANALYZE-DECISION] Error:", error.message);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
