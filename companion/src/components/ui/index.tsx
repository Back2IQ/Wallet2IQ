import * as React from 'react';
import { cn } from '@/lib/utils';

/* ─── Button ─────────────────────────────────────────────────── */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-signal-emerald text-vault-950 hover:bg-signal-emerald/90 active:bg-signal-emerald/80 shadow-vault-glow font-semibold',
  secondary:
    'bg-vault-800 text-vault-100 hover:bg-vault-700 border border-vault-700',
  ghost: 'text-vault-200 hover:bg-vault-800/60',
  danger:
    'bg-signal-rose/90 text-white hover:bg-signal-rose font-semibold',
  outline:
    'border border-vault-700 text-vault-100 hover:border-vault-600 hover:bg-vault-800/40',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-emerald/50 focus-visible:ring-offset-2 focus-visible:ring-offset-vault-950',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

/* ─── Card ───────────────────────────────────────────────────── */

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'flat' | 'elevated' }
>(({ className, variant = 'flat', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(variant === 'elevated' ? 'panel-elevated' : 'panel', className)}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1 p-6 pb-3', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-base font-semibold text-vault-100 tracking-tight', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-vault-400', className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-3', className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center gap-2 p-6 pt-0', className)} {...props} />
);

/* ─── Input / Textarea ───────────────────────────────────────── */

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg bg-vault-900 border border-vault-700 px-3 py-2 text-sm',
        'placeholder:text-vault-500 text-vault-100 font-mono',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal-emerald/60 focus-visible:border-signal-emerald/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex w-full rounded-lg bg-vault-900 border border-vault-700 px-3 py-2 text-sm',
      'placeholder:text-vault-500 text-vault-100 font-mono leading-relaxed',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal-emerald/60 focus-visible:border-signal-emerald/40',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('text-xs font-medium text-vault-300 uppercase tracking-wide', className)} {...props} />
);

/* ─── Badge ──────────────────────────────────────────────────── */

type BadgeTone = 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'neutral';

const badgeTones: Record<BadgeTone, string> = {
  emerald: 'bg-signal-emerald/10 text-signal-emerald border-signal-emerald/30',
  amber: 'bg-signal-amber/10 text-signal-amber border-signal-amber/30',
  rose: 'bg-signal-rose/10 text-signal-rose border-signal-rose/30',
  sky: 'bg-signal-sky/10 text-signal-sky border-signal-sky/30',
  violet: 'bg-signal-violet/10 text-signal-violet border-signal-violet/30',
  neutral: 'bg-vault-800 text-vault-300 border-vault-700',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xxs font-medium font-mono tracking-wide',
        badgeTones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* ─── Separator ──────────────────────────────────────────────── */

export const Separator = ({ className }: { className?: string }) => (
  <div className={cn('h-px w-full bg-vault-800', className)} />
);

/* ─── Status Dot ─────────────────────────────────────────────── */

export function StatusDot({ tone = 'emerald', pulse = false }: { tone?: BadgeTone; pulse?: boolean }) {
  const colors: Record<BadgeTone, string> = {
    emerald: 'bg-signal-emerald',
    amber: 'bg-signal-amber',
    rose: 'bg-signal-rose',
    sky: 'bg-signal-sky',
    violet: 'bg-signal-violet',
    neutral: 'bg-vault-500',
  };
  return (
    <span className="relative inline-flex">
      <span className={cn('w-2 h-2 rounded-full', colors[tone])} />
      {pulse && (
        <span
          className={cn('absolute inset-0 w-2 h-2 rounded-full animate-pulse-ring', colors[tone])}
        />
      )}
    </span>
  );
}

/* ─── Code block ─────────────────────────────────────────────── */

export function Code({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        'font-mono text-xs bg-vault-900 border border-vault-800 rounded px-1.5 py-0.5 text-vault-200',
        className,
      )}
    >
      {children}
    </code>
  );
}

/* ─── ExplainerBlock ─────────────────────────────────────────── */

export function Explainer({
  title,
  children,
  tone = 'sky',
}: {
  title: string;
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  const borderMap: Record<BadgeTone, string> = {
    emerald: 'border-l-signal-emerald',
    amber: 'border-l-signal-amber',
    rose: 'border-l-signal-rose',
    sky: 'border-l-signal-sky',
    violet: 'border-l-signal-violet',
    neutral: 'border-l-vault-500',
  };
  return (
    <div
      className={cn(
        'border-l-2 bg-vault-900/40 rounded-r-lg px-4 py-3 text-sm text-vault-300 leading-relaxed',
        borderMap[tone],
      )}
    >
      <div className="text-xxs font-semibold uppercase tracking-wider text-vault-400 mb-1">{title}</div>
      <div>{children}</div>
    </div>
  );
}
