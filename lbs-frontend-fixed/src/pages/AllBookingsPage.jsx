import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function AllBookingsPage() {
  const { bookings } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  const statusVariant = (s) =>
    s === 'confirmed' ? 'default' :
    s === 'cancelled' ? 'secondary' :
    s === 'rejected'  ? 'destructive' : 'secondary';

  const statusColor = (s) =>
    s === 'confirmed' ? 'bg-success/20 text-success border-success/30' :
    s === 'cancelled' ? 'bg-muted text-muted-foreground border-border' :
    s === 'rejected'  ? 'bg-destructive/20 text-destructive border-destructive/30' :
    'bg-warning/20 text-warning border-warning/30';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">All Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of all venue bookings</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({bookings.length})</SelectItem>
            <SelectItem value="confirmed">Confirmed ({bookings.filter(b => b.status === 'confirmed').length})</SelectItem>
            <SelectItem value="cancelled">Cancelled ({bookings.filter(b => b.status === 'cancelled').length})</SelectItem>
            <SelectItem value="rejected">Rejected ({bookings.filter(b => b.status === 'rejected').length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No bookings found for this filter.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(b => (
          <Card key={b.id} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{b.purpose}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium text-foreground">{b.facultyName}</span>
                    {' • '}{b.venueName}{' • '}{b.date}{' • '}{b.timeSlotLabel}
                  </p>
                  {b.notes && (
                    <p className="text-xs text-muted-foreground/70 mt-1 italic">Note: {b.notes}</p>
                  )}
                  {b.equipmentNeeded && b.equipmentNeeded.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {b.equipmentNeeded.map(eq => (
                        <span key={eq} className="text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground rounded">{eq}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    Booked {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize shrink-0 ${statusColor(b.status)}`}>
                  {b.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
