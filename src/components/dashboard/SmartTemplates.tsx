import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Heart, Home, GraduationCap, DollarSign, Users } from 'lucide-react';

const TEMPLATES = [
  { id: 'career', icon: Briefcase, label: 'Career Move', desc: 'Job change, promotion, pivot', color: 'text-blue-500 bg-blue-500/10' },
  { id: 'relationship', icon: Heart, label: 'Relationship', desc: 'Love, friendship, family', color: 'text-pink-500 bg-pink-500/10' },
  { id: 'financial', icon: DollarSign, label: 'Financial', desc: 'Investment, purchase, budget', color: 'text-green-500 bg-green-500/10' },
  { id: 'education', icon: GraduationCap, label: 'Education', desc: 'Study, course, skill', color: 'text-purple-500 bg-purple-500/10' },
  { id: 'living', icon: Home, label: 'Living', desc: 'Move, housing, lifestyle', color: 'text-amber-500 bg-amber-500/10' },
  { id: 'social', icon: Users, label: 'Social', desc: 'Community, network, events', color: 'text-cyan-500 bg-cyan-500/10' },
];

const SmartTemplates = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Start Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TEMPLATES.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/decision/new?category=${t.id}`)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all text-center group"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{t.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartTemplates;
