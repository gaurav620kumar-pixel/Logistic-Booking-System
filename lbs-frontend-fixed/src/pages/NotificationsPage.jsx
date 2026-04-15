import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CalendarCheck, XCircle, Calendar, MessageSquare, Settings, Wrench, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const typeConfig = {
  booking:      { icon: CalendarCheck, color: 'text-success',          link: '/my-bookings' },
  cancellation: { icon: XCircle,       color: 'text-destructive',      link: '/my-bookings' },
  timetable:    { icon: Calendar,      color: 'text-primary',          link: '/my-bookings' },
  request:      { icon: MessageSquare, color: 'text-info',             link: '/requests' },
  system:       { icon: Settings,      color: 'text-muted-foreground', link: '/settings' },
  equipment:    { icon: Wrench,        color: 'text-warning',          link: '/equipment-requests' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllRead } = useApp();
  const navigate = useNavigate();
  if (!user) return null;

  // ✅ FIX: user.id → user._id
  const notifs = notifications
    .filter(n =>  n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = notifs.filter(n => !n.read).length;

  const handleClick = (n) => {
    // ✅ FIX: n.id → n._id
    markNotificationRead(n.id);

    const cfg = typeConfig[n.type] || typeConfig.system;
    const dest = n.link || cfg.link;
    navigate(dest);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            // ✅ FIX: user.id → user._id
            onClick={() =>markAllRead(user.id)
}
            className="text-xs"
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const cfg = typeConfig[n.type] || typeConfig.system;
            const Icon = cfg.icon;
            return (
              <Card
                // ✅ FIX: n.id → n._id
               
                className={`shadow-card transition-all cursor-pointer hover:shadow-card-hover group
                  ${!n.read ? 'border-l-4 border-l-primary bg-primary/5' : 'opacity-80 hover:opacity-100'}`}
                onClick={() => handleClick(n)}
                title="Click to view details"
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-muted-foreground/60">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to view →
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}