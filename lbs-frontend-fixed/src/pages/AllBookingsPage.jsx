import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AllBookingsPage() {
  const { bookings, approveBooking, rejectBooking } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter);

  // ✅ FIX: make async
  const handleApprove = async (id) => {
    await approveBooking(id);
    toast.success('Booking approved! Faculty has been notified.');
  };

  const handleReject = async (id) => {
    await rejectBooking(id, rejectReason);
    setRejectingId(null);
    setRejectReason('');
    toast.info('Booking rejected. Faculty has been notified.');
  };

  const statusVariant = (s) => s === 'approved' ? 'default' : s === 'pending' ? 'secondary' : 'destructive';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">All Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage all venue bookings</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({bookings.length})</SelectItem>
            <SelectItem value="pending">Pending ({bookings.filter(b=>b.status==='pending').length})</SelectItem>
            <SelectItem value="approved">Approved ({bookings.filter(b=>b.status==='approved').length})</SelectItem>
            <SelectItem value="rejected">Rejected ({bookings.filter(b=>b.status==='rejected').length})</SelectItem>
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
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Badge variant={statusVariant(b.status)} className="capitalize">
                    {b.status}
                  </Badge>
                  {b.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" onClick={() => handleApprove(b.id)}
                        className="bg-success hover:bg-success/90 text-success-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => { setRejectingId(b.id); setRejectReason(''); }}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {rejectingId === b.id && (
                <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-foreground">Rejection reason (optional):</p>
                  <textarea
                    className="w-full text-xs rounded border border-border bg-background p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={2}
                    placeholder="Enter reason for rejection..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleReject(b.id)}>Confirm Reject</Button>
                    <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}