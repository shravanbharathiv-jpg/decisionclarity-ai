import { cn } from '@/lib/utils';

interface FormattedTextProps {
  content: string;
  className?: string;
}

export const FormattedText = ({ content, className }: FormattedTextProps) => {
  if (!content) return null;

  // Split content into sections based on headers and formatting
  const sections = content.split(/(?=^#{1,3}\s|\n\n(?=\d+\.|•|-|\*\s))/m);

  const formatSection = (text: string, index: number) => {
    // Check if it's a header
    if (text.startsWith('###')) {
      return (
        <h4 key={index} className="text-base font-semibold text-foreground mt-6 mb-3">
          {text.replace(/^###\s*/, '')}
        </h4>
      );
    }
    if (text.startsWith('##')) {
      return (
        <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3">
          {text.replace(/^##\s*/, '')}
        </h3>
      );
    }
    if (text.startsWith('#')) {
      return (
        <h2 key={index} className="text-xl font-semibold text-foreground mt-6 mb-4">
          {text.replace(/^#\s*/, '')}
        </h2>
      );
    }

    // Check if it's a list
    const lines = text.split('\n').filter(line => line.trim());
    const isList = lines.some(line => /^(\d+\.|•|-|\*)\s/.test(line.trim()));

    if (isList) {
      return (
        <ul key={index} className="space-y-2 my-4">
          {lines.map((line, i) => {
            const isListItem = /^(\d+\.|•|-|\*)\s/.test(line.trim());
            if (!isListItem) {
              return (
                <p key={i} className="text-foreground/90 leading-relaxed">
                  {formatInlineText(line)}
                </p>
              );
            }
            const content = line.replace(/^(\d+\.|•|-|\*)\s*/, '').trim();
            return (
              <li key={i} className="text-foreground/90 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-muted-foreground">
                {formatInlineText(content)}
              </li>
            );
          })}
        </ul>
      );
    }

    // Regular paragraph
    return (
      <p key={index} className="text-foreground/90 leading-relaxed my-4">
        {formatInlineText(text.trim())}
      </p>
    );
  };

  const formatInlineText = (text: string): React.ReactNode => {
    // Bold text
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      {sections.map((section, index) => formatSection(section, index))}
    </div>
  );
};
