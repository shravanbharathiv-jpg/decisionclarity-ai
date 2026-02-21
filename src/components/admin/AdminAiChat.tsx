import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bot, Send, Loader2, Database, Code, Sparkles, X } from 'lucide-react';
import { FormattedText } from '@/components/FormattedText';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const APP_KNOWLEDGE = `You are ClarityBot, the internal AI assistant for the Clarity app team. You have deep knowledge of the entire application.

## App Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Lovable Cloud) — PostgreSQL, Edge Functions, Auth, RLS
- **AI**: Lovable AI Gateway (Gemini) as primary, 8 Groq API keys as fallback
- **Payments**: Stripe integration for subscriptions and one-time payments

## Database Tables
- **decisions**: Core table — stores all decision data (title, description, steps, biases, scenarios, etc.)
- **profiles**: User profiles linked to auth.users — stores email, subscription info, Stripe IDs
- **bias_profiles**: Per-user bias analysis results
- **decision_reflections**: 30/90/180-day post-decision reflections
- **decision_scores**: AI-generated quality scores for decisions
- **decision_comparisons**: Side-by-side decision analysis
- **decision_shares**: Advisor sharing with tokens
- **advisor_comments**: Comments from shared advisors
- **user_roles**: Admin role management (app_role enum: admin, user)
- **decision_templates**: Pre-built decision frameworks

## Key Features
- **Deep Decisions**: 5-step structured process (Deconstruct → Scenarios → Bias Check → Second-Order → Lock)
- **Quick Decisions**: 30-second heuristic analysis for low-stakes choices
- **Clair AI Agent**: App-wide chatbot using Groq/Lovable AI
- **Decision Streaks & Gamification**: XP, levels, achievements
- **Mood Check-In**: Emotional state tracking before decisions
- **AI Predictions**: Pattern-based future decision insights
- **Bias Profiling**: AI-analyzed personal bias patterns
- **Decision Timeline**: Visual history of all decisions
- **Comparison Mode**: Side-by-side analysis of multiple options

## Pricing
- **Free**: 5 quick decisions/month, 1 deep decision (first 10 users)
- **Monthly Pro**: £4.99/month — unlimited everything
- **Yearly Pro**: £29.99/year — unlimited everything
- **Lifetime**: £49.99 one-time — unlimited everything + 7-day trial

## Edge Functions
- analyze-decision, analyze-reflection, score-decision: AI analysis
- create-payment, check-payment: Stripe one-time payments
- create-subscription, check-subscription: Stripe subscriptions
- customer-portal: Stripe billing management
- clair-chat: AI chatbot with Groq fallback chain
- send-welcome-email: Resend email on signup

## Auth
- Email + password signup (no email verification link)
- Admin email: shravanbvidhya@gmail.com (auto-pro access)
- Protected routes redirect to /auth

## RLS Policies
- All tables use user_id-based RLS
- Admins have special SELECT access on decisions and profiles
- user_roles uses has_role() security definer function

You can answer questions about the app, suggest improvements, debug issues, and help with strategy. When in data mode, you also have access to live database metrics.`;

interface AdminAiChatProps {
  users: any[];
  decisions: any[];
}

const AdminAiChat = ({ users, decisions }: AdminAiChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataMode, setDataMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const context = dataMode
      ? `\n\n[LIVE DATA CONTEXT]\nTotal users: ${users.length}\nPaid users: ${users.filter(u => u.subscription_tier !== 'free' && u.subscription_tier).length}\nTotal decisions: ${decisions.length}\nCompleted decisions: ${decisions.filter(d => d.is_locked).length}\nRecent signups (last 7 days): ${users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 86400000)).length}`
      : '';

    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('clair-chat', {
        body: {
          messages: [
            { role: 'system', content: APP_KNOWLEDGE + context },
            ...allMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          ]
        }
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Error generating response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect. Try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => { setIsOpen(true); if (messages.length === 0) setMessages([{ role: 'assistant', content: "Hey team! 👋 I'm ClarityBot, your internal AI assistant. I know everything about our app architecture, database, features, and metrics. Toggle Data Mode to include live stats in my responses. Ask me anything!" }]); }}
        className="gap-2" variant="outline">
        <Bot className="h-4 w-4" />
        ClarityBot
      </Button>
    );
  }

  return (
    <Card className="border-primary/30 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            ClarityBot
            <Badge variant="secondary" className="text-[10px]">Internal</Badge>
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Data Mode</span>
              <Switch checked={dataMode} onCheckedChange={setDataMode} />
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-full">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div ref={scrollRef} className="h-[300px] overflow-y-auto space-y-3 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}>
                {msg.role === 'assistant' ? <FormattedText content={msg.content} /> : msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about the app..." className="flex-1 text-sm" disabled={isLoading} />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminAiChat;
