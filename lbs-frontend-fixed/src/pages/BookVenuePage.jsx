import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIME_SLOTS = [
  { id: 'ts1', startTime: '08:00', endTime: '09:00', label: '8:00 AM - 9:00 AM',   display: '8–9 AM'   },
  { id: 'ts2', startTime: '09:00', endTime: '10:00', label: '9:00 AM - 10:00 AM',  display: '9–10 AM'  },
  { id: 'ts3', startTime: '10:00', endTime: '11:00', label: '10:00 AM - 11:00 AM', display: '10–11 AM' },
  { id: 'ts4', startTime: '11:00', endTime: '12:00', label: '11:00 AM - 12:00 PM', display: '11–12 PM' },
  { id: 'ts5', startTime: '12:00', endTime: '13:00', label: '12:00 PM - 1:00 PM',  display: '12–1 PM'  },
  { id: 'ts6', startTime: '13:00', endTime: '14:00', label: '1:00 PM - 2:00 PM',   display: '1–2 PM'   },
  { id: 'ts7', startTime: '14:00', endTime: '15:00', label: '2:00 PM - 3:00 PM',   display: '2–3 PM'   },
  { id: 'ts8', startTime: '15:00', endTime: '16:00', label: '3:00 PM - 4:00 PM',   display: '3–4 PM'   },
  { id: 'ts9', startTime: '16:00', endTime: '17:00', label: '4:00 PM - 5:00 PM',   display: '4–5 PM'   },
];

function getMonday(weekOffset) {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function toYMD(d) {
  return d.toISOString().split('T')[0];
}

const isPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

export default function BookVenuePage() {
  const { user } = useAuth();
  const { venues, bookings, users, createBooking, createCompromiseRequest } = useApp();
  const navigate = useNavigate();

  const [venueId, setVenueId]             = useState('');
  const [weekOffset, setWeekOffset]       = useState(0);
  const [selected, setSelected]           = useState(null);
  const [purpose, setPurpose]             = useState('');
  const [notes, setNotes]                 = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [occupiedSel, setOccupiedSel]     = useState(null);
  const [reqReason, setReqReason]         = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);

  const availableVenues = venues.filter(v => v.status !== 'maintenance');
  const selectedVenue   = venues.find(v => v.id === venueId);

  const weekDays = useMemo(() => {
    const monday = getMonday(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const weekLabel = `${formatDate(weekDays[0])} – ${formatDate(weekDays[6])}`;

  const occupiedMap = useMemo(() => {
    const map = new Map();
    bookings.forEach(b => {
      if (b.status !== 'rejected' && b.status !== 'cancelled') {
        map.set(`${b.venueId}|${b.date}|${b.timeSlotId}`, b);
      }
    });
    return map;
  }, [bookings]);

  const getBooking = (dateStr, slotId) =>
    venueId ? occupiedMap.get(`${venueId}|${dateStr}|${slotId}`) : undefined;

  const handleSlotClick = (date, dateStr, slotIndex) => {
    if (!venueId) { toast.error('Please select a venue first.'); return; }
    setOccupiedSel(null); setReqReason('');
    if (selected?.dateStr === dateStr && selected?.slotIndex === slotIndex) {
      setSelected(null);
    } else {
      setSelected({ date, dateStr, slotIndex });
      setPurpose(''); setNotes('');
    }
  };

  const handleOccupiedClick = (date, dateStr, slotIndex, booking) => {
    if (booking.facultyId === user.id) {
      toast.info('This slot is already booked by you.'); return;
    }
    setSelected(null);
    if (occupiedSel?.dateStr === dateStr && occupiedSel?.slotIndex === slotIndex) {
      setOccupiedSel(null); setReqReason('');
    } else {
      setOccupiedSel({ booking, date, dateStr, slotIndex }); setReqReason('');
    }
  };

  const handleSubmit = async () => {
    if (!selected || !purpose.trim()) { toast.error('Please fill in the purpose.'); return; }
    const slot = TIME_SLOTS[selected.slotIndex];
    setSubmitting(true);
    try {
      await createBooking({
        venueId,
        venueName:       selectedVenue?.name || '',
        facultyId:       user.id,
        facultyName:     user.name,
        date:            selected.dateStr,
        timeSlotId:      slot.id,
        timeSlotLabel:   slot.label,
        purpose:         purpose.trim(),
        notes:           notes.trim(),
        equipmentNeeded: selectedVenue?.equipment?.slice(0, 2) || [],
      });
      toast.success('Venue booked successfully!');
      navigate('/my-bookings');
    } catch { toast.error('Failed to book. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const handleSendRequest = async () => {
    if (!reqReason.trim()) { toast.error('Please provide a reason.'); return; }
    const { booking, dateStr, slotIndex } = occupiedSel;
    const slot      = TIME_SLOTS[slotIndex];
    const toFaculty = users.find(u => u.id === booking.facultyId);
    setReqSubmitting(true);
    try {
      await createCompromiseRequest({
        fromFacultyId:   user.id,
        fromFacultyName: user.name,
        toFacultyId:     booking.facultyId,
        toFacultyName:   toFaculty?.name || booking.facultyName,
        bookingId:       booking.id,
        venueId,
        venueName:       selectedVenue?.name || '',
        date:            dateStr,
        timeSlot:        slot.label,
        timeSlotId:      slot.id,
        reason:          reqReason.trim(),
      });
      toast.success('Request sent! The faculty will be notified.');
      setOccupiedSel(null); setReqReason('');
    } catch { toast.error('Failed to send request. Please try again.'); }
    finally { setReqSubmitting(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Book a Venue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Click a green slot to book instantly. Click a red slot to request it from the current holder.
        </p>
      </div>

      {/* Venue + week nav */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Select Venue</Label>
              <Select value={venueId} onValueChange={(v) => { setVenueId(v); setSelected(null); setOccupiedSel(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a venue to see availability" />
                </SelectTrigger>
                <SelectContent>
                  {availableVenues.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} — {v.type} ({v.capacity} seats)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedVenue && (
              <div className="flex flex-wrap gap-1 sm:max-w-xs">
                {selectedVenue.equipment.map(eq => (
                  <span key={eq} className="text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground rounded">{eq}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <Button variant="outline" size="icon" className="h-8 w-8"
                onClick={() => { setWeekOffset(w => w - 1); setSelected(null); setOccupiedSel(null); }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[140px] text-center">{weekLabel}</span>
              <Button variant="outline" size="icon" className="h-8 w-8"
                onClick={() => { setWeekOffset(w => w + 1); setSelected(null); setOccupiedSel(null); }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar grid */}
      <Card className="shadow-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid border-b border-border" style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}>
                <div className="bg-muted/50 border-r border-border" />
                {weekDays.map((d, i) => {
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className="bg-muted/50 border-r border-border last:border-r-0 py-2 px-1 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{DAYS[i]}</p>
                      <div className={`text-sm font-medium mt-0.5 mx-auto w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {TIME_SLOTS.map((slot, si) => (
                <div key={slot.id} className="grid border-b border-border last:border-b-0"
                  style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}>
                  <div className="bg-muted/30 border-r border-border flex items-center justify-end pr-2">
                    <span className="text-[10px] text-muted-foreground">{slot.display}</span>
                  </div>
                  {weekDays.map((d, di) => {
                    const dateStr       = toYMD(d);
                    const booking       = getBooking(dateStr, slot.id);
                    const occupied      = !!booking;
                    const past          = isPast(d);
                    const noVenue       = !venueId;
                    const isMyBooking   = occupied && booking.facultyId === user.id;
                    const isSelAvail    = selected?.dateStr === dateStr && selected?.slotIndex === si;
                    const isSelOccupied = occupiedSel?.dateStr === dateStr && occupiedSel?.slotIndex === si;

                    let cellClass = 'border-r border-border last:border-r-0 h-12 flex items-center justify-center transition-colors ';
                    if (past || noVenue)     cellClass += 'bg-muted/20 cursor-default';
                    else if (isMyBooking)    cellClass += 'bg-primary/10 cursor-not-allowed';
                    else if (occupied)       cellClass += isSelOccupied ? 'bg-warning/20 ring-2 ring-inset ring-warning cursor-pointer' : 'bg-destructive/10 hover:bg-destructive/20 cursor-pointer';
                    else if (isSelAvail)     cellClass += 'bg-primary/15 ring-2 ring-inset ring-primary cursor-pointer';
                    else                     cellClass += 'bg-success/5 hover:bg-success/20 cursor-pointer';

                    return (
                      <div key={di} className={cellClass}
                        title={noVenue ? 'Select a venue first' : past ? 'Past slot' : isMyBooking ? `Your booking: ${booking.purpose}` : occupied ? `Booked by ${booking.facultyName} — click to request` : 'Click to book instantly'}
                        onClick={() => {
                          if (past || noVenue) return;
                          if (isMyBooking) { toast.info('This is your own booking.'); return; }
                          if (occupied) handleOccupiedClick(d, dateStr, si, booking);
                          else handleSlotClick(d, dateStr, si);
                        }}>
                        {isMyBooking    && <span className="text-[9px] font-medium text-primary">Mine</span>}
                        {occupied && !isMyBooking && <span className="text-[9px] font-medium text-destructive">{isSelOccupied ? 'Requesting' : 'Occupied'}</span>}
                        {isSelAvail     && <span className="text-[9px] font-medium text-primary">Selected</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5 px-4 py-3 border-t border-border bg-muted/20 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-success/20 border border-success/40" />
              <span className="text-[11px] text-muted-foreground">Available — click to book instantly</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-destructive/10 border border-destructive/30" />
              <span className="text-[11px] text-muted-foreground">Occupied — click to request</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-primary/10 border border-primary/30" />
              <span className="text-[11px] text-muted-foreground">Your booking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available slot booking form */}
      {selected && (
        <Card className="shadow-card border-primary/30 animate-fade-in">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Book This Slot Instantly</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedVenue?.name} &bull; {DAYS[weekDays.findIndex(d => toYMD(d) === selected.dateStr)]} {formatDate(selected.date)} &bull; {TIME_SLOTS[selected.slotIndex].label}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Purpose <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Data Structures Seminar" value={purpose} onChange={e => setPurpose(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Additional Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea placeholder="Any special requirements..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
              </div>
              <Button className="w-full gradient-primary text-primary-foreground"
                disabled={!purpose.trim() || submitting} onClick={handleSubmit}>
                {submitting ? 'Booking...' : 'Book Instantly'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Occupied slot request form */}
      {occupiedSel && (
        <Card className="shadow-card border-warning/40 animate-fade-in">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-warning" />
                  <h2 className="text-sm font-semibold text-foreground">Request This Slot</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedVenue?.name} &bull; {DAYS[weekDays.findIndex(d => toYMD(d) === occupiedSel.dateStr)]} {formatDate(occupiedSel.date)} &bull; {TIME_SLOTS[occupiedSel.slotIndex].label}
                </p>
                <p className="text-xs text-warning mt-1">
                  Held by <strong>{occupiedSel.booking.facultyName}</strong> for "{occupiedSel.booking.purpose}"
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOccupiedSel(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Reason for requesting <span className="text-destructive">*</span></Label>
                <Textarea placeholder="e.g. Urgent lab session rescheduled by HOD, need this exact time..."
                  value={reqReason} onChange={e => setReqReason(e.target.value)} rows={3} />
              </div>
              <Button className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
                disabled={!reqReason.trim() || reqSubmitting} onClick={handleSendRequest}>
                {reqSubmitting ? 'Sending...' : `Send Request to ${occupiedSel.booking.facultyName}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}