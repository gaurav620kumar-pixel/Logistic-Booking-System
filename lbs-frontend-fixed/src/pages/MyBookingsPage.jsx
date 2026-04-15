import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { bookings } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  if (!user) return null;

  // ✅ FIX HERE (_id instead of id)
  const myBookings = bookings.filter(b => b.facultyId === user.id);

  const filtered = statusFilter === 'all'
    ? myBookings
    : myBookings.filter(b => b.status === statusFilter);

  const statusIcon = { approved: CheckCircle2, pending: Clock, rejected: XCircle };
  const statusColor = { approved: 'text-success', pending: 'text-warning', rejected: 'text-destructive' };
  const statusVariant = (s) => s === 'approved' ? 'default' : s === 'pending' ? 'secondary' : 'destructive';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all your venue booking requests</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({myBookings.length})</SelectItem>
              <SelectItem value="pending">Pending ({myBookings.filter(b=>b.status==='pending').length})</SelectItem>
              <SelectItem value="approved">Approved ({myBookings.filter(b=>b.status==='approved').length})</SelectItem>
              <SelectItem value="rejected">Rejected ({myBookings.filter(b=>b.status==='rejected').length})</SelectItem>
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
            const Icon = statusIcon[b.status] || AlertCircle;
            const iconColor = statusColor[b.status] || 'text-muted-foreground';
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
                        <Badge variant={statusVariant(b.status)} className="capitalize shrink-0">{b.status}</Badge>
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
                      {b.status === 'approved' && (
                        <button
                          className="text-xs text-primary hover:underline mt-1.5 flex items-center gap-1"
                          onClick={() => navigate('/requests')}
                        >
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