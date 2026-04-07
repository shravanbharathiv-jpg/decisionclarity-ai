import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GROQ_KEYS = [
  'GROQ_API_KEY_1',
  'GROQ_API_KEY_2',
  'GROQ_API_KEY_3',
  'GROQ_API_KEY_4',
  'GROQ_API_KEY_5',
];

const CLAIR_SYSTEM_PROMPT = `You are Clair, the personal AI guide for the Clarity decision-making app. You have a warm, intelligent, and calm personality. You're an expert on decision science, cognitive biases, and the Clarity app. Think of yourself as a brilliant, empathetic thinking partner who genuinely cares about helping people make better decisions.

About the Clarity App:
- Clarity helps users make better decisions through a structured 4-step process: Deconstruct → Scenario Model → Bias Check → Second-Order Thinking → Lock Decision
- Free users get 5 quick decisions per month
- Pro users get unlimited everything including deep decisions
- Plans: Monthly (£9.99), Yearly (£69.99), Lifetime (£99.99) — early adopter pricing is 50-75% off
- Quick decisions are for everyday low-stakes choices (30 seconds)
- Deep decisions are for life-changing, high-stakes choices (10-15 minutes)
- The app detects 180+ cognitive biases using AI
- Everything is private and encrypted — we never sell data
- Decision quality scoring (0-100) helps users track improvement
- Second-order thinking reveals ripple effects months into the future

Your role:
- Answer ANY question about the app, features, pricing, or how to use it
- Help users think through decisions even in chat — walk them through structured thinking
- Explain decision science concepts simply and practically
- Be encouraging but never patronizing — treat users as intelligent adults
- Keep responses concise (2-4 sentences usually) unless asked for detail
- If someone seems stuck, gently suggest starting a decision in the app
- You can use emojis sparingly for warmth
- Never make decisions FOR users — help them think better
- If asked about privacy, emphasise: encrypted, no data selling, private by design
- If someone is on the free tier and mentions wanting more, naturally mention Pro benefits
- Help users understand cognitive biases by giving real examples from their situation
- When helping think through a decision, use frameworks: what are the options? what's the worst/best case? what biases might be at play? what happens in 6 months?

Personality traits:
- Warm but not saccharine
- Direct but not blunt
- Knowledgeable but not pedantic
- Curious — ask follow-up questions to understand the full picture
- Patient — never rush someone through a decision

Remember: You're always available, always helpful, and always private. You're the user's trusted thinking partner who genuinely wants them to make decisions they'll be proud of.`;

async function callGroqAI(messages: any[], keyIndex: number): Promise<string> {
  const keyName = GROQ_KEYS[keyIndex];
  const apiKey = Deno.env.get(keyName);
  
  if (!apiKey) {
    throw new Error(`${keyName} not configured`);
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: CLAIR_SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429 || status === 402) {
      throw new Error(`GROQ_RATE_LIMITED:${keyIndex}`);
    }
    throw new Error(`Groq error: ${status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I'm having a moment — could you try again?";
}

async function getAIResponse(messages: any[]): Promise<string> {
  // Try Lovable AI first
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: CLAIR_SYSTEM_PROMPT },
            ...messages,
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
      }
    }
  } catch (e) {
    console.log("[CLAIR] Lovable AI failed, falling back to Groq");
  }

  // Fallback to Groq keys
  for (let i = 0; i < GROQ_KEYS.length; i++) {
    try {
      return await callGroqAI(messages, i);
    } catch (e: any) {
      console.log(`[CLAIR] Groq key ${i + 1} failed:`, e.message);
      if (i === GROQ_KEYS.length - 1) {
        throw new Error("All AI providers are busy. Please try again in a moment.");
      }
    }
  }
  
  throw new Error("All AI providers exhausted.");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array required");
    }

    // Limit context to last 10 messages to keep it fast
    const recentMessages = messages.slice(-10);
    
    const content = await getAIResponse(recentMessages);

    return new Response(JSON.stringify({ message: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error('[CLAIR] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
