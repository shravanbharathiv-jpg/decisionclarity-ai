import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  type: 'insight' | 'scenario' | 'bias' | 'recommendation' | 'profile';
  decisionTitle?: string;
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
  decisions?: Array<{
    title: string;
    category?: string;
    detected_biases?: string[];
    time_horizon?: string;
    is_reversible?: string;
    biggest_fear?: string;
    future_regret?: string;
  }>;
}

// Groq API keys for fallback (8 total)
const GROQ_KEYS = [
  'GROQ_API_KEY_1',
  'GROQ_API_KEY_2', 
  'GROQ_API_KEY_3',
  'GROQ_API_KEY_4',
  'GROQ_API_KEY_5',
  'GROQ_API_KEY_6',
  'GROQ_API_KEY_7',
  'GROQ_API_KEY_8',
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

  console.log(`[ANALYZE-DECISION] Trying Groq key ${keyIndex + 1}/${GROQ_KEYS.length}`);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "groq/compound",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
      temperature: 0.1,
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
    
    // Profile type doesn't need decisionTitle, it uses decisions array
    if (type !== 'profile' && (!data.decisionTitle || data.decisionTitle.trim() === '')) {
      throw new Error("Decision title is required");
    }
    
    console.log(`[ANALYZE-DECISION] Processing ${type} analysis`);

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
    } else if (type === 'profile') {
      // Profile analysis for bias patterns across multiple decisions
      if (!data.decisions || data.decisions.length < 2) {
        throw new Error("At least 2 decisions are required for profile analysis");
      }
      
      systemPrompt = `You are a behavioral psychology expert specializing in decision-making patterns. Analyze the user's decision history to identify patterns, biases, and tendencies. Be constructive and insightful. Provide actionable self-awareness tips.`;
      
      const decisionsText = data.decisions.map((d, i) => 
        `Decision ${i + 1}: "${d.title}"
  - Category: ${d.category || 'General'}
  - Time horizon: ${d.time_horizon || 'Not specified'}
  - Reversible: ${d.is_reversible || 'Not specified'}
  - Biggest fear: ${d.biggest_fear || 'Not specified'}
  - Future regret: ${d.future_regret || 'Not specified'}
  - Detected biases: ${d.detected_biases?.join(', ') || 'None'}`
      ).join('\n\n');
      
      userPrompt = `Analyze these ${data.decisions.length} decisions to create a psychological profile:

${decisionsText}

Provide a comprehensive but concise analysis with:
1. **Overall Decision-Making Style**: 2-3 sentences describing their approach
2. **Risk Tolerance**: Low/Medium/High with brief explanation
3. **Common Biases**: List 2-4 recurring biases with evidence
4. **Fear Patterns**: What drives their concerns?
5. **Strengths**: 2-3 positive patterns in their decision-making
6. **Growth Areas**: 2-3 actionable suggestions for improvement

Keep the total response under 400 words. Be encouraging but honest.`;
    }

    const analysis = await getAIResponse(systemPrompt, userPrompt);

    if (!analysis) {
      throw new Error("AI returned an empty response.");
    }

    let biases: string[] = [];
    if (type === 'bias' || type === 'profile') {
      const commonBiases = [
        "Confirmation bias", "Sunk cost fallacy", "Status quo bias", 
        "Overconfidence", "Loss aversion", "Anchoring", 
        "Availability heuristic", "Fear avoidance", "Optimism bias",
        "Recency bias", "Bandwagon effect"
      ];
      biases = commonBiases.filter(b => new RegExp(b, "gi").test(analysis));
    }
    
    // For profile type, extract additional structured data
    if (type === 'profile') {
      // Try to extract risk tolerance from the analysis
      let riskTolerance = 'Medium';
      if (/risk tolerance[:\s]*(low)/gi.test(analysis)) riskTolerance = 'Low';
      else if (/risk tolerance[:\s]*(high)/gi.test(analysis)) riskTolerance = 'High';
      
      return new Response(JSON.stringify({ 
        summary: analysis,
        common_biases: biases.length > 0 ? biases : undefined,
        risk_tolerance: riskTolerance,
        fear_patterns: null, // Could be extracted with more sophisticated parsing
        overconfidence_patterns: null,
        provider: 'ai'
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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