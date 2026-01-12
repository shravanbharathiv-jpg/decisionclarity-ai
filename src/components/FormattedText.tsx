import { cn } from '@/lib/utils';

interface FormattedTextProps {
  content: string;
  className?: string;
}

export const FormattedText = ({ content, className }: FormattedTextProps) => {
  if (!content) return null;

  // Clean up the content - normalize line breaks and whitespace
  const cleanContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Split content into lines for processing
  const lines = cleanContent.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let keyIndex = 0;

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const ListTag = listType;
      elements.push(
        <ListTag key={keyIndex++} className={cn(
          "my-4 space-y-2",
          listType === 'ol' ? "list-decimal list-inside" : "list-none"
        )}>
          {currentList.map((item, i) => (
            <li key={i} className="text-foreground/90 leading-relaxed pl-0">
              {listType === 'ul' && (
                <span className="text-primary mr-2">•</span>
              )}
              {formatInlineText(item)}
            </li>
          ))}
        </ListTag>
      );
      currentList = [];
      listType = null;
    }
  };

  const formatInlineText = (text: string): React.ReactNode => {
    // Handle bold, italic, and inline code
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines but flush any pending list
    if (!trimmedLine) {
      flushList();
      continue;
    }

    // Headers
    if (trimmedLine.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={keyIndex++} className="text-base font-semibold text-foreground mt-6 mb-3 first:mt-0">
          {formatInlineText(trimmedLine.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={keyIndex++} className="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0">
          {formatInlineText(trimmedLine.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmedLine.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={keyIndex++} className="text-xl font-semibold text-foreground mt-6 mb-4 first:mt-0">
          {formatInlineText(trimmedLine.slice(2))}
        </h2>
      );
      continue;
    }

    // Unordered list items (-, *, •)
    const ulMatch = trimmedLine.match(/^[-•*]\s+(.+)$/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(ulMatch[1]);
      continue;
    }

    // Ordered list items (1., 2., etc.)
    const olMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(olMatch[1]);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={keyIndex++} className="text-foreground/90 leading-relaxed my-3 first:mt-0 last:mb-0">
        {formatInlineText(trimmedLine)}
      </p>
    );
  }

  // Flush any remaining list
  flushList();

  return (
    <div className={cn("prose prose-sm max-w-none text-foreground/90", className)}>
      {elements}
    </div>
  );
};