import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { mockTimeSlots } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BookVenuePage() {
  const { user } = useAuth();
  const { venues, bookings, createBooking } = useApp();
  const navigate = useNavigate();
  const [venueId, setVenueId] = useState('');
  const [date, setDate] = useState('');
  const [timeSlotId, setTimeSlotId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  const availableVenues = venues.filter(v => v.status !== 'maintenance');

  // ✅ FIX: string comparison
  const selectedVenue = venues.find(
  v => String(v.id) === venueId
);

  const hasConflict = venueId && date && timeSlotId
    ? bookings.some(b =>
        b.venueId === venueId &&
        b.date === date &&
        b.timeSlotId === timeSlotId &&
        b.status !== 'rejected' &&
        b.status !== 'cancelled'
      )
    : false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasConflict) {
      toast.error('This slot is already booked. Please choose a different time or venue.');
      return;
    }

    const slot = mockTimeSlots.find(ts => ts.id === timeSlotId);

    try {
      await createBooking({
        venueId,
        venueName: selectedVenue?.name || '',
        facultyId: user.id,
        facultyName: user.name,
        date,
        timeSlotId,
        timeSlotLabel: slot?.label || '',
        purpose,
        notes,
        equipmentNeeded: selectedVenue?.equipment?.slice(0, 2) || [],
      });
      toast.success('Booking request submitted! Awaiting admin approval.');
      navigate('/my-bookings');
    } catch (err) {
      toast.error('Failed to submit booking. Please try again.');
      console.error('Booking error:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Book a Venue</h1>
        <p className="text-sm text-muted-foreground mt-1">Request a classroom, lab, or hall for your session</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Select Venue</Label>
              <Select value={venueId} onValueChange={setVenueId}>
                <SelectTrigger><SelectValue placeholder="Choose a venue" /></SelectTrigger>
                <SelectContent>
                  {availableVenues.map(v => (
                    // ✅ FIX: force string
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.name} — {v.type} ({v.capacity} seats)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedVenue && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium text-foreground">{selectedVenue.name}</p>
                <p className="text-muted-foreground text-xs">
                  {selectedVenue.building} • Floor {selectedVenue.floor} • {selectedVenue.capacity} seats
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedVenue.equipment.map(eq => (
                    <Badge key={eq} variant="secondary" className="text-[10px]">{eq}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
            </div>

            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select value={timeSlotId} onValueChange={setTimeSlotId}>
                <SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger>
                <SelectContent>
                  {mockTimeSlots.map(ts => (
                    <SelectItem key={ts.id} value={ts.id}>{ts.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasConflict && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>This venue is already booked for this date & time slot.</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Purpose</Label>
              <Input placeholder="e.g., Data Structures Seminar" value={purpose} onChange={e => setPurpose(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes (optional)</Label>
              <Textarea placeholder="Any special requirements, equipment needs, or other details..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground"
              disabled={!venueId || !date || !timeSlotId || !purpose || hasConflict}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Submit Booking Request
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
        <span>After booking, you can request equipment setup from support staff via the <strong>Requests</strong> page.</span>
      </div>
    </div>
  );
}