import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const MOODS = [
  { emoji: '😌', label: 'Calm', color: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' },
  { emoji: '😤', label: 'Frustrated', color: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' },
  { emoji: '😰', label: 'Anxious', color: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' },
  { emoji: '🤔', label: 'Thoughtful', color: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20' },
  { emoji: '😊', label: 'Confident', color: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20' },
  { emoji: '😵', label: 'Overwhelmed', color: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20' },
];

const MOOD_TIPS: Record<string, string> = {
  'Calm': "Great headspace for decisions. Your clarity is at its peak right now. 🌟",
  'Frustrated': "Take a breath first. Frustration narrows our thinking — a quick walk might help before deciding. 🌿",
  'Anxious': "Anxiety amplifies worst-case scenarios. Try writing down your fears first — they shrink on paper. 📝",
  'Thoughtful': "Perfect state for deep analysis. Your mind is primed for nuanced thinking. 💡",
  'Confident': "Confidence is great, but watch for overconfidence bias. Challenge your assumptions. ⚖️",
  'Overwhelmed': "Break it down. Start with just one small aspect of your decision. Small steps lead to clarity. 🪜",
};

const MoodCheckIn = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    try { return sessionStorage.getItem('clarity_mood'); } catch { return null; }
  });

  const handleMoodSelect = (label: string) => {
    setSelectedMood(label);
    try { sessionStorage.setItem('clarity_mood', label); } catch {}
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          How are you feeling?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!selectedMood ? (
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map(m => (
              <button
                key={m.label}
                onClick={() => handleMoodSelect(m.label)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${m.color}`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs text-foreground">{m.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{MOODS.find(m => m.label === selectedMood)?.emoji}</span>
              <span className="text-sm font-medium text-foreground">Feeling {selectedMood.toLowerCase()}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {MOOD_TIPS[selectedMood]}
            </p>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedMood(null); sessionStorage.removeItem('clarity_mood'); }}>
              Update mood
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodCheckIn;
