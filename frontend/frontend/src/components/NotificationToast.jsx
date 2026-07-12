import { useNotification } from '../context/NotificationContext';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const CONFIG = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    icon_color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    glow: 'shadow-emerald-500/10',
  },
  error: {
    icon: XCircle,
    bar: 'bg-red-500',
    icon_color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    glow: 'shadow-red-500/10',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-amber-500',
    icon_color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    glow: 'shadow-amber-500/10',
  },
  info: {
    icon: Info,
    bar: 'bg-blue-500',
    icon_color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    glow: 'shadow-blue-500/10',
  },
};

function Toast({ notification }) {
  const { dismiss } = useNotification();
  const cfg = CONFIG[notification.type] || CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      className={`relative w-80 rounded-xl border glass-panel shadow-xl ${cfg.bg} ${cfg.glow} animate-toast-in overflow-hidden`}
    >
      {/* Top progress bar */}
      <div className={`absolute top-0 left-0 h-0.5 ${cfg.bar} animate-progress`} style={{ animationDuration: '4s', width: '100%' }} />

      <div className="flex items-start gap-3 p-4">
        <div className={`mt-0.5 shrink-0 ${cfg.icon_color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          {notification.title && (
            <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{notification.title}</p>
          )}
          {notification.message && (
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{notification.message}</p>
          )}
        </div>
        <button
          onClick={() => dismiss(notification.id)}
          className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function NotificationToast() {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className="pointer-events-auto">
          <Toast notification={n} />
        </div>
      ))}
    </div>
  );
}


