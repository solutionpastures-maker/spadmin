import fs from 'fs';
import path from 'path';

const x = 'motion';
const d = 'div';
const file = path.join(process.cwd(), 'components/action-card.tsx');

const content = `import Link from 'next/link';
import { LucideIcon, Plus } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  color?: 'primary' | 'accent' | 'secondary';
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  color = 'primary',
}: ActionCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    secondary: 'bg-secondary/10 text-secondary',
  };

  const bgColorClasses = {
    primary: 'bg-primary/5 hover:bg-primary/10',
    accent: 'bg-accent/5 hover:bg-accent/10',
    secondary: 'bg-secondary/5 hover:bg-secondary/10',
  };

  const card = (
    <WRAPPER
      className={\`p-6 rounded-xl border-2 border-primary/30 cursor-pointer transition-all duration-300 \${bgColorClasses[color]} group hover:border-primary/50 relative overflow-hidden\`}
    >
      <WRAPPER className="absolute top-0 left-0 w-1 h-full bg-primary group-hover:w-full transition-all duration-300 opacity-10" />
      <WRAPPER className="flex items-start justify-between mb-4">
        <WRAPPER className={\`w-12 h-12 rounded-lg flex items-center justify-center \${colorClasses[color]}\`}>
          <Icon size={24} />
        </WRAPPER>
        <Plus
          size={20}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-foreground"
        />
      </WRAPPER>
      <h3 className="font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </WRAPPER>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {card}
      </button>
    );
  }

  return <Link href={href ?? '/'}>{card}</Link>;
}
`.replaceAll('WRAPPER', d);

fs.writeFileSync(file, content);
console.log('action-card updated');
