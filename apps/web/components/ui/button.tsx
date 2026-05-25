import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'ghost' | 'outline';
type ButtonSize = 'default' | 'icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  default: 'bg-emerald-700 text-white hover:bg-emerald-800',
  destructive: 'bg-rose-700 text-white hover:bg-rose-800',
  ghost: 'text-stone-700 hover:bg-stone-100',
  outline: 'border border-stone-300 bg-white text-stone-900 hover:bg-stone-100',
};

const sizeClassName: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  icon: 'h-10 w-10',
};

export function Button({
  asChild,
  className,
  size = 'default',
  type = 'button',
  variant = 'default',
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        variantClassName[variant],
        sizeClassName[size],
        className,
      )}
      type={asChild ? undefined : type}
      {...props}
    />
  );
}
