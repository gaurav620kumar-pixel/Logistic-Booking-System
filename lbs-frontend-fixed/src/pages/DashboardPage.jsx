import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, MapPin, Bell, Clock, Wrench, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const { bookings, venues, notifications, equipmentRequests } = useApp();
  const navigate = useNavigate();
  if (!user) return null;

  // ✅ FIX: user.id → user.id
  const userBookings     = user.role === 'admin' ? bookings : bookings.filter(b => b.facultyId === user.id);
  const userNotifs       = notifications.filter(n => n.userId === user.id && !n.read);
  const pendingBookings  = bookings.filter(b => b.status === 'pending');
  const approvedBookings = userBookings.filter(b => b.status === 'approved');
  const maintenanceVenues = venues.filter(v => v.status === 'maintenance');

  // ✅ FIX: user.id → user.id
 const myEquipReqs = equipmentRequests.filter(
  e => String(e.staffId) === String(user.id || user.id)
);
  const statCards = user.role === 'admin' ? [
    { label: 'Total Bookings',     value: bookings.length,           icon: CalendarCheck, color: 'text-primary',     link: '/all-bookings' },
    { label: 'Pending Approvals',  value: pendingBookings.length,    icon: Clock,         color: 'text-warning',     link: '/all-bookings' },
    { label: 'Total Venues',       value: venues.length,             icon: MapPin,        color: 'text-success',     link: '/manage-venues' },
    { label: 'Under Maintenance',  value: maintenanceVenues.length,  icon: AlertTriangle, color: 'text-destructive', link: '/manage-venues' },
  ] : user.role === 'staff' ? [
    { label: 'Equipment Requests', value: myEquipReqs.length,                                       icon: Wrench,        color: 'text-primary',     link: '/equipment-requests' },
    { label: 'Pending Setup',      value: myEquipReqs.filter(e => e.status === 'pending').length,   icon: Clock,         color: 'text-warning',     link: '/equipment-requests' },
    // ✅ FIX HERE
    { label: 'Assigned Venues',    value: venues.filter(v => String(v.assignedStaff) === String(user.id || user.id)).length,   icon: MapPin,        color: 'text-success',     link: '/venues' },
    { label: 'Unread Alerts',      value: userNotifs.length,                                        icon: Bell,          color: 'text-destructive', link: '/notifications' },
  ] : [
    { label: 'My Bookings', value: userBookings.length,    icon: CalendarCheck, color: 'text-primary',     link: '/my-bookings' },
    // ✅ FIX HERE
    { label: 'Pending',     value: pendingBookings.filter(b => b.facultyId === user.id).length, icon: Clock, color: 'text-warning', link: '/my-bookings' },
    { label: 'Approved',    value: approvedBookings.length, icon: CalendarCheck, color: 'text-success',    link: '/my-bookings' },
    { label: 'Notifications', value: userNotifs.length,    icon: Bell,          color: 'text-info',        link: '/notifications' },
  ];

  const statusVariant = (s) => s === 'approved' ? 'default' : s === 'pending' ? 'secondary' : 'destructive';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Welcome, {user.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user.role === 'admin'
            ? 'System overview & management'
            : user.role === 'staff'
            ? 'Equipment & venue management'
            : "Here's your booking overview"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className="shadow-card hover:shadow-card-hover transition-all cursor-pointer hover:scale-[1.02] active:scale-100 border hover:border-primary/30"
            onClick={() => navigate(s.link)}
            title={`Go to ${s.label}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className={`text-2xl font-heading font-bold ${s.color}`}>{s.value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-heading">Recent Bookings</CardTitle>
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => navigate(user.role === 'admin' ? '/all-bookings' : '/my-bookings')}
            >
              View all →
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {userBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {userBookings.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{b.purpose}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.venueName} • {b.date} • {b.timeSlotLabel}
                    </p>
                    {user.role === 'admin' && (
                      <p className="text-xs text-muted-foreground">by {b.facultyName}</p>
                    )}
                  </div>
                  <Badge variant={statusVariant(b.status)} className="ml-2 shrink-0 capitalize">
                    {b.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-heading">Venue Availability</CardTitle>
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => navigate(user.role === 'admin' ? '/manage-venues' : '/venues')}
            >
              View all →
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {venues.slice(0, 6).map(v => (
              <div
                key={v.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(user.role === 'admin' ? '/manage-venues' : '/venues')}
              >
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                  v.status === 'available' ? 'bg-success' :
                  v.status === 'maintenance' ? 'bg-warning' : 'bg-destructive'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{v.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{v.type} • {v.capacity} seats • {v.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}