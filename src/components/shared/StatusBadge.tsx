import { CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react';
import { DeploymentStatus } from '@/store/deployStore';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: DeploymentStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = {
    success: {
      icon: CheckCircle2,
      label: 'Success',
      className: 'bg-success/10 text-success border-success/20',
    },
    failed: {
      icon: XCircle,
      label: 'Failed',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    'in-progress': {
      icon: Loader2,
      label: 'In Progress',
      className: 'bg-warning/10 text-warning border-warning/20',
      animate: true,
    },
    idle: {
      icon: Circle,
      label: 'Idle',
      className: 'bg-muted/10 text-muted-foreground border-muted/20',
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', config.animate && 'animate-spin')} />
      {config.label}
    </span>
  );
};
