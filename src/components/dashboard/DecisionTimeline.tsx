import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, Circle } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

interface TimelineDecision {
  id: string;
  title: string;
  created_at: string;
  is_locked: boolean;
  category: string;
}

const groupByDate = (decisions: TimelineDecision[]) => {
  const groups: { label: string; items: TimelineDecision[] }[] = [];
  const map = new Map<string, TimelineDecision[]>();

  decisions.forEach(d => {
    const date = new Date(d.created_at);
    let label: string;
    if (isToday(date)) label = 'Today';
    else if (isYesterday(date)) label = 'Yesterday';
    else if (isThisWeek(date)) label = 'This Week';
    else label = format(date, 'MMM yyyy');

    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(d);
  });

  map.forEach((items, label) => groups.push({ label, items }));
  return groups;
};

const DecisionTimeline = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState<TimelineDecision[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('decisions')
      .select('id, title, created_at, is_locked, category')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setDecisions(data); });
  }, [user]);

  if (decisions.length === 0) return null;

  const groups = groupByDate(decisions);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Decision Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.label}>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{group.label}</p>
              <div className="space-y-1 relative ml-3 border-l border-border/50 pl-4">
                {group.items.map(d => (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/decision/${d.id}`)}
                    className="flex items-center gap-2 w-full text-left py-1.5 hover:bg-muted/50 rounded-md px-2 -ml-2 transition-colors group"
                  >
                    <div className="absolute -left-[0.3rem]">
                      {d.is_locked ? (
                        <CheckCircle className="h-3 w-3 text-primary bg-background" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground bg-background" />
                      )}
                    </div>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors truncate flex-1">{d.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{format(new Date(d.created_at), 'h:mm a')}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DecisionTimeline;
