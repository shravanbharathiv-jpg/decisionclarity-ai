import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReflectionRequest {
  type: 'reflection' | 'comparison' | 'second_order' | 'bias_profile' | 'summarize';
  decisionTitle?: string;
  originalDecision?: string;
  originalReasoning?: string;
  agedWell?: boolean;
  whatSurprised?: string;
  whatDifferently?: string;
  reflectionType?: string;
  decisions?: Array<{
    title: string;
    description: string;
    finalDecision: string;
    category: string;
  }>;
  currentContext?: string;
  allBiases?: string[];
  decisionPatterns?: any;
  content?: string; // For summarization
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

  console.log(`[ANALYZE-REFLECTION] Trying Groq key ${keyIndex + 1}/${GROQ_KEYS.length}`);

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
  try {
    console.log("[ANALYZE-REFLECTION] Trying Lovable AI...");
    const result = await callLovableAI(systemPrompt, userPrompt);
    console.log("[ANALYZE-REFLECTION] Lovable AI succeeded");
    return result;
  } catch (error: any) {
    console.log("[ANALYZE-REFLECTION] Lovable AI failed:", error.message);
    console.log("[ANALYZE-REFLECTION] Switching to Groq fallback...");
    
    // Try each Groq key in sequence on ANY Lovable AI failure
    for (let i = 0; i < GROQ_KEYS.length; i++) {
      try {
        const result = await callGroqAI(systemPrompt, userPrompt, i);
        console.log(`[ANALYZE-REFLECTION] Groq key ${i + 1} succeeded`);
        return result;
      } catch (groqError: any) {
        console.log(`[ANALYZE-REFLECTION] Groq key ${i + 1} failed:`, groqError.message);
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
    const { type, ...data }: ReflectionRequest = await req.json();
    console.log(`[ANALYZE-REFLECTION] Processing ${type} analysis`);

    let systemPrompt = "";
    let userPrompt = "";

    if (type === 'reflection') {
      systemPrompt = `You are a thoughtful analyst helping someone reflect on a past decision. Be calm, insightful, and help them extract learning. Present insights as clear bullet points.`;
      
      userPrompt = `Analyze this decision reflection:

Decision: ${data.decisionTitle}
Original decision: ${data.originalDecision}
Original reasoning: ${data.originalReasoning}
Time since: ${data.reflectionType?.replace('_', ' ')}
Aged well: ${data.agedWell ? 'Yes' : 'No'}
Surprises: ${data.whatSurprised || 'Not provided'}
Would do differently: ${data.whatDifferently || 'Not provided'}

Provide:
1. Key learning (2 bullet points)
2. Pattern to watch in future decisions`;
    } else if (type === 'comparison') {
      systemPrompt = `You are an expert at comparing decisions. Be analytical and direct. Use bullet points.`;
      
      const decisionsText = data.decisions?.map((d, i) => 
        `Option ${String.fromCharCode(65 + i)}: ${d.title}\nCategory: ${d.category}\nDescription: ${d.description}\nDecision: ${d.finalDecision}`
      ).join('\n\n') || 'No decisions provided';
      
      userPrompt = `Compare these decisions:

${decisionsText}

Provide:
1. Best risk/reward option
2. Hidden opportunity costs (2 bullet points)
3. Emotional bias differences`;
    } else if (type === 'second_order') {
      systemPrompt = `You are an expert in second-order thinking. Help people see consequences beyond the obvious. Use bullet points.`;
      
      userPrompt = `Analyze second-order effects:

Decision: ${data.decisionTitle}
Context: ${data.currentContext || 'Not provided'}

Provide:
1. What this makes easier later (2 bullets)
2. What doors this closes (2 bullets)  
3. Habits/patterns this reinforces`;
    } else if (type === 'bias_profile') {
      systemPrompt = `You are building a bias profile based on decision patterns. Be observational, not judgmental. Present as clear insights.`;
      
      userPrompt = `Analyze this user's decision patterns:

Detected biases: ${data.allBiases?.join(', ') || 'None recorded'}
Patterns: ${JSON.stringify(data.decisionPatterns) || 'No patterns yet'}

Provide:
1. Top 2-3 recurring biases
2. Risk tolerance observation
3. One specific pattern to watch`;
    } else if (type === 'summarize') {
      systemPrompt = `You are an expert at creating clear, digestible summaries. Transform complex analysis into actionable bullet points that are easy to scan and understand. Be concise but preserve key insights.`;
      
      userPrompt = `Summarize this content into a digestible format with 3-5 key bullet points:

${data.content || 'No content provided'}

Format as:
• **Key Point 1:** Brief explanation
• **Key Point 2:** Brief explanation
• **Key Point 3:** Brief explanation
(Continue as needed, max 5 points)

Keep each point under 20 words. Focus on actionable insights.`;
    }

    const analysis = await getAIResponse(systemPrompt, userPrompt);
    
    console.log("[ANALYZE-REFLECTION] Analysis generated successfully");

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[ANALYZE-REFLECTION] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});