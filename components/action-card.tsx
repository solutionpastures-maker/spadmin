import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  color?: 'primary' | 'accent' | 'secondary';
}

export function ActionCard({ title, description, icon: Icon, href, onClick }: ActionCardProps) {
  const inner = (
    <>
      <div className="admin-quick-icon">
        <Icon size={18} />
      </div>
      <span>{title}</span>
      {description ? (
        <span className="text-[11px] font-normal text-muted-foreground leading-snug">{description}</span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="admin-quick-action">
        {inner}
      </button>
    );
  }

  return (
    <Link href={href ?? '/'} className="admin-quick-action">
      {inner}
    </Link>
  );
}
