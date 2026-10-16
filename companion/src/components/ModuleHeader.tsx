import type { ReactNode } from 'react';

export function ModuleHeader({
  icon,
  title,
  subtitle,
  badges,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badges?: ReactNode[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-signal-emerald/10 border border-signal-emerald/30 flex items-center justify-center text-signal-emerald">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-vault-100">{title}</h1>
          <p className="text-sm text-vault-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {badges && badges.length > 0 && <div className="flex gap-2 flex-wrap">{badges}</div>}
    </div>
  );
}
