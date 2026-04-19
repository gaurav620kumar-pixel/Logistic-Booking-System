import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Check, X, Wrench, SendHorizontal, CalendarCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const EQUIPMENT_ITEMS = [
  'Projector', 'HDMI Cable', 'Whiteboard Markers', 'Duster',
  'Extension Board', 'Sound System', 'Mic/Podium', 'Laptop Stand',
  'Recording Setup', 'AC Remote', 'Extra Chairs',
];

export default function RequestsPage() {
  const { user } = useAuth();
  const { compromiseRequests, respondCompromiseRequest,
          createEquipmentRequest, equipmentRequests, venues, users } = useApp();
  if (!user) return null;

  const [activeTab, setActiveTab]       = useState('compromise');
  const [showEquipForm, setShowEquipForm] = useState(false);
  const [eForm, setEForm]               = useState({ venueId: '', date: '', timeSlot: '', selectedItems: [], customItem: '' });
  const [responding, setResponding]     = useState(null);

  // Incoming requests — other faculty requesting my slots
  const incoming = compromiseRequests.filter(r => r.toFacultyId === user.id);
  // Outgoing requests — I sent to other faculty
  const outgoing = compromiseRequests.filter(r => r.fromFacultyId === user.id);
  // My equipment requests
  const myEquipRequests = equipmentRequests.filter(r => r.facultyId === user.id);

  const toggleItem = (item) => {
    setEForm(f => ({
      ...f,
      selectedItems: f.selectedItems.includes(item)
        ? f.selectedItems.filter(i => i !== item)
        : [...f.selectedItems, item],
    }));
  };

  const handleSendEquipment = async () => {
    if (!eForm.venueId) { toast.error('Please select a venue.'); return; }
    const items = [...eForm.selectedItems, ...(eForm.customItem ? [eForm.customItem] : [])];
    if (items.length === 0) { toast.error('Please select at least one item.'); return; }
    const venue = venues.find(v => v.id === eForm.venueId);
    try {
      await createEquipmentRequest({
        facultyId:   user.id,
        facultyName: user.name,
        venueId:     eForm.venueId,
        venueName:   venue?.name || '',
        staffId:     venue?.assignedStaff || '',
        items,
        date:        eForm.date || new Date().toISOString().split('T')[0],
        timeSlot:    eForm.timeSlot,
      });
      toast.success('Equipment request sent to support staff!');
      setShowEquipForm(false);
      setEForm({ venueId: '', date: '', timeSlot: '', selectedItems: [], customItem: '' });
      setActiveTab('equipment');
    } catch { toast.error('Failed to send request.'); }
  };

  const handleRespond = async (reqId, status) => {
    setResponding(reqId + status);
    try {
      await respondCompromiseRequest(reqId, status);
      if (status === 'accepted') {
        toast.success('Slot transferred! The faculty has been notified and the booking is confirmed.');
      } else {
        toast.info('Request declined.');
      }
    } catch { toast.error('Failed to respond. Please try again.'); }
    finally { setResponding(null); }
  };

  const statusBadge = (s) =>
    s === 'accepted' ? 'bg-success/20 text-success border-success/30' :
    s === 'declined' ? 'bg-destructive/20 text-destructive border-destructive/30' :
    'bg-warning/20 text-warning border-warning/30';

  const tabs = [
    { key: 'compromise', label: 'Slot Requests',       count: incoming.filter(r => r.status === 'pending').length },
    { key: 'outgoing',   label: 'My Requests',          count: outgoing.filter(r => r.status === 'pending').length },
    { key: 'equipment',  label: 'Equipment Requests',   count: myEquipRequests.filter(r => r.status === 'pending').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Slot transfer requests & equipment setup</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground"
          onClick={() => { setShowEquipForm(true); }}>
          <Wrench className="mr-1.5 h-3.5 w-3.5" /> Request Equipment
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors
              ${activeTab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
            {t.count > 0 && (
              <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Incoming slot requests (others want my slot) ── */}
      {activeTab === 'compromise' && (
        <div className="space-y-3">
          {incoming.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No slot requests from other faculty.</p>
            </div>
          ) : (
            incoming.map(r => (
              <Card key={r.id} className={`shadow-card ${r.status === 'pending' ? 'border-l-4 border-l-warning' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.fromFacultyName}</p>
                      <p className="text-xs text-muted-foreground">
                        wants your slot: <strong>{r.venueName}</strong> • {r.date} • {r.timeSlot}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize shrink-0 ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg mb-3">
                    <p className="text-xs text-muted-foreground italic">"{r.reason}"</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm"
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                        disabled={responding === r.id + 'accepted'}
                        onClick={() => handleRespond(r.id, 'accepted')}>
                        <Check className="h-3.5 w-3.5 mr-1" />
                        {responding === r.id + 'accepted' ? 'Transferring...' : 'Accept & Transfer Slot'}
                      </Button>
                      <Button size="sm" variant="outline"
                        className="flex-1 text-destructive border-destructive/40 hover:bg-destructive/10"
                        disabled={responding === r.id + 'declined'}
                        onClick={() => handleRespond(r.id, 'declined')}>
                        <X className="h-3.5 w-3.5 mr-1" />
                        {responding === r.id + 'declined' ? 'Declining...' : 'Decline'}
                      </Button>
                    </div>
                  )}
                  {r.status === 'accepted' && (
                    <p className="text-xs text-success font-medium flex items-center gap-1">
                      <CalendarCheck className="h-3.5 w-3.5" /> Slot transferred to {r.fromFacultyName}
                    </p>
                  )}
                  {r.status === 'declined' && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <X className="h-3.5 w-3.5" /> Request declined
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Outgoing requests (I sent to others) ── */}
      {activeTab === 'outgoing' && (
        <div className="space-y-3">
          {outgoing.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">You haven't sent any slot requests yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Click on an occupied slot in Book Venue to request it.</p>
            </div>
          ) : (
            outgoing.map(r => (
              <Card key={r.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Request to {r.toFacultyName}</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>{r.venueName}</strong> • {r.date} • {r.timeSlot}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize shrink-0 ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Your reason: <span className="italic">"{r.reason}"</span></p>
                  </div>
                  {r.status === 'accepted' && (
                    <p className="text-xs text-success font-medium mt-2 flex items-center gap-1">
                      <CalendarCheck className="h-3.5 w-3.5" /> Slot transferred to you — check My Bookings
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Equipment requests ── */}
      {activeTab === 'equipment' && (
        <div className="space-y-3">
          {myEquipRequests.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No equipment requests yet.</p>
            </div>
          ) : (
            myEquipRequests.map(r => {
              const staff = users.find(u => u.id === r.staffId);
              return (
                <Card key={r.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm">{r.venueName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize shrink-0 ${
                        r.status === 'ready' ? 'bg-success/20 text-success border-success/30' :
                        r.status === 'acknowledged' ? 'bg-primary/20 text-primary border-primary/30' :
                        'bg-warning/20 text-warning border-warning/30'}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.date} • {r.timeSlot}</p>
                    <p className="text-xs mt-1">Items: {r.items.join(', ')}</p>
                    {staff && <p className="text-xs text-muted-foreground mt-0.5">Staff: {staff.name}</p>}
                    {r.notes && <p className="text-xs text-muted-foreground mt-1 italic">{r.notes}</p>}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Equipment request form */}
      {showEquipForm && (
        <Card className="shadow-card border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Request Equipment from Support Staff</p>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowEquipForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <select className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
              value={eForm.venueId} onChange={e => setEForm({ ...eForm, venueId: e.target.value })}>
              <option value="">Select venue</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <Input type="date" value={eForm.date} onChange={e => setEForm({ ...eForm, date: e.target.value })} />
            <Input placeholder="Time slot e.g. 10:00 AM - 11:00 AM"
              value={eForm.timeSlot} onChange={e => setEForm({ ...eForm, timeSlot: e.target.value })} />
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_ITEMS.map(item => (
                <button key={item} onClick={() => toggleItem(item)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    eForm.selectedItems.includes(item)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent'}`}>
                  {item}
                </button>
              ))}
            </div>
            <Input placeholder="Any other requirement..."
              value={eForm.customItem} onChange={e => setEForm({ ...eForm, customItem: e.target.value })} />
            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSendEquipment}>
              <SendHorizontal className="mr-2 h-4 w-4" /> Send Equipment Request
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
