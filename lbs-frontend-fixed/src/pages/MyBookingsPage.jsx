import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { bookings } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  if (!user) return null;

  const myBookings = bookings.filter(b => b.facultyId === user.id);
  const filtered = statusFilter === 'all'
    ? myBookings
    : myBookings.filter(b => b.status === statusFilter);

  const statusIcon  = { confirmed: CalendarCheck, cancelled: XCircle, rejected: XCircle };
  const statusColor = { confirmed: 'text-success', cancelled: 'text-muted-foreground', rejected: 'text-destructive' };

  const statusBadgeClass = (s) =>
    s === 'confirmed' ? 'bg-success/20 text-success border-success/30' :
    s === 'cancelled' ? 'bg-muted text-muted-foreground border-border' :
    s === 'rejected'  ? 'bg-destructive/20 text-destructive border-destructive/30' :
    'bg-warning/20 text-warning border-warning/30';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">All your venue bookings</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({myBookings.length})</SelectItem>
              <SelectItem value="confirmed">Confirmed ({myBookings.filter(b => b.status === 'confirmed').length})</SelectItem>
              <SelectItem value="cancelled">Cancelled ({myBookings.filter(b => b.status === 'cancelled').length})</SelectItem>
              <SelectItem value="rejected">Rejected ({myBookings.filter(b => b.status === 'rejected').length})</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => navigate('/book')}>
            + New
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <CalendarCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No bookings found.</p>
          <Button className="mt-4 gradient-primary text-primary-foreground" size="sm" onClick={() => navigate('/book')}>
            Book a Venue
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const Icon       = statusIcon[b.status]  || AlertCircle;
            const iconColor  = statusColor[b.status] || 'text-muted-foreground';
            return (
              <Card key={b.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-foreground">{b.purpose}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize shrink-0 ${statusBadgeClass(b.status)}`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {b.venueName} • {b.date} • {b.timeSlotLabel}
                      </p>
                      {b.equipmentNeeded && b.equipmentNeeded.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {b.equipmentNeeded.map(eq => (
                            <span key={eq} className="text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground rounded">{eq}</span>
                          ))}
                        </div>
                      )}
                      {b.notes && (
                        <p className="text-xs text-muted-foreground/70 mt-1 italic">Note: {b.notes}</p>
                      )}
                      {b.status === 'confirmed' && (
                        <button className="text-xs text-primary hover:underline mt-1.5 flex items-center gap-1"
                          onClick={() => navigate('/requests')}>
                          + Request equipment setup for this booking
                        </button>
                      )}
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
