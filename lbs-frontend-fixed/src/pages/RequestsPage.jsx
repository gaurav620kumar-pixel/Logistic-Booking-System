import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Check, X, Plus, Wrench, SendHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const EQUIPMENT_ITEMS = [
  'Projector', 'HDMI Cable', 'Whiteboard Markers', 'Duster',
  'Extension Board', 'Sound System', 'Mic/Podium', 'Laptop Stand',
  'Recording Setup', 'AC Remote', 'Extra Chairs',
];

export default function RequestsPage() {
  const { user } = useAuth();
  const { compromiseRequests, createCompromiseRequest, respondCompromiseRequest,
          createEquipmentRequest, equipmentRequests, bookings, venues, users } = useApp();
  if (!user) return null;

  const [activeTab, setActiveTab] = useState('compromise');
  const [showCompromiseForm, setShowCompromiseForm] = useState(false);
  const [cForm, setCForm] = useState({ toFacultyId: '', bookingId: '', reason: '' });
  const [showEquipForm, setShowEquipForm] = useState(false);
  const [eForm, setEForm] = useState({ venueId: '', date: '', timeSlot: '', selectedItems: [], customItem: '' });

  // ✅ FIXED
  const incoming = compromiseRequests.filter(r => r.toFacultyId === user.id);
  const outgoing = compromiseRequests.filter(r => r.fromFacultyId === user.id);
  const myEquipRequests = equipmentRequests.filter(
  r => String(r.facultyId) === String(user.id || user.id)
);
  const facultyList = users.filter(u => u.role === 'faculty' && u._id !== user.id);
  const myBookings = bookings.filter(b => b.facultyId === user.id && b.status === 'approved');

  const toggleItem = (item) => {
    setEForm(f => ({
      ...f,
      selectedItems: f.selectedItems.includes(item)
        ? f.selectedItems.filter(i => i !== item)
        : [...f.selectedItems, item],
    }));
  };

  const handleSendCompromise = () => {
    if (!cForm.toFacultyId || !cForm.reason.trim()) {
      toast.error('Please select a faculty and provide a reason.'); return;
    }
    const booking = bookings.find(b => b.id === cForm.bookingId);
    const toFaculty = users.find(u => u.id === cForm.toFacultyId);

    createCompromiseRequest({
      fromFacultyId: user.id,
      fromFacultyName: user.name,
      toFacultyId: cForm.toFacultyId,
      toFacultyName: toFaculty?.name || '',
      bookingId: cForm.bookingId,
      venueName: booking?.venueName || 'N/A',
      date: booking?.date || '',
      timeSlot: booking?.timeSlotLabel || '',
      reason: cForm.reason,
    });

    toast.success('Compromise request sent! The faculty will be notified.');
    setShowCompromiseForm(false);
    setCForm({ toFacultyId: '', bookingId: '', reason: '' });
    setActiveTab('compromise');
  };

  const handleSendEquipment = () => {
    if (!eForm.venueId) { toast.error('Please select a venue.'); return; }

    const items = [...eForm.selectedItems, ...(eForm.customItem ? [eForm.customItem] : [])];
    if (items.length === 0) { toast.error('Please select at least one equipment item.'); return; }

    const venue = venues.find(v =>v.id === eForm.venueId);

    createEquipmentRequest({
      facultyId: user.id,
      facultyName: user.name,
      venueId: eForm.venueId,
      venueName: venue?.name || '',
      staffId: venue?.assignedStaff || '',
      items,
      date: eForm.date || new Date().toISOString().split('T')[0],
      timeSlot: eForm.timeSlot,
    });

    toast.success('Equipment request sent to support staff!');
    setShowEquipForm(false);
    setEForm({ venueId: '', date: '', timeSlot: '', selectedItems: [], customItem: '' });
    setActiveTab('equipment');
  };

  const tabs = [
    { key: 'compromise', label: 'Venue Requests', count: incoming.filter(r => r.status === 'pending').length },
    { key: 'equipment',  label: 'Equipment Requests', count: myEquipRequests.filter(r => r.status === 'pending').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Venue compromises & equipment setup requests</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setShowCompromiseForm(true); setShowEquipForm(false); }}>
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Venue Request
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => { setShowEquipForm(true); setShowCompromiseForm(false); }}>
            <Wrench className="mr-1.5 h-3.5 w-3.5" /> Request Equipment
          </Button>
        </div>
      </div>

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

      {/* IMPORTANT FIXES BELOW ONLY */}
      {activeTab === 'equipment' && (
  <div className="space-y-3">
    {myEquipRequests.length === 0 ? (
      <p className="text-muted-foreground text-sm">No equipment requests yet.</p>
    ) : (
      myEquipRequests.map(r => {
        const staff = users.find(u => u.id === r.staffId);
        return (
          <Card key={r.id}>
            <CardContent className="p-4">
              <p className="font-semibold">{r.venueName}</p>
              <p className="text-xs text-muted-foreground">
                {r.date} • {r.timeSlot}
              </p>
              <p className="text-xs mt-1">
                Items: {r.items.join(', ')}
              </p>
              <p className="text-xs mt-1">
  Status: <span className="font-semibold capitalize">{r.status}</span>
</p>
              <p className="text-xs mt-1 text-muted-foreground">
                Staff: {staff?.name || 'N/A'}
              </p>
            </CardContent>
          </Card>
        );
      })
    )}
  </div>
)}
{showEquipForm && (
  <Card className="shadow-card">
    <CardContent className="p-4 space-y-3">

      <p className="text-sm font-semibold">Request Equipment / Setup from Support Staff</p>

      {/* VENUE */}
      <select
        className="w-full border rounded px-2 py-1"
        value={eForm.venueId}
        onChange={(e) => setEForm({ ...eForm, venueId: e.target.value })}
      >
        <option value="">Select venue</option>
        {venues.map(v => (
          <option key={v._id || v.id} value={String(v._id || v.id)}>
            {v.name}
          </option>
        ))}
      </select>

      {/* DATE */}
      <Input
        type="date"
        value={eForm.date}
        onChange={(e) => setEForm({ ...eForm, date: e.target.value })}
      />

      {/* TIME SLOT */}
      <Input
        placeholder="e.g. 10:00 AM - 11:00 AM"
        value={eForm.timeSlot}
        onChange={(e) => setEForm({ ...eForm, timeSlot: e.target.value })}
      />

      {/* EQUIPMENT ITEMS */}
      <div className="flex flex-wrap gap-1">
        {EQUIPMENT_ITEMS.map(item => (
         <Badge
  key={item}
  onClick={() => toggleItem(item)}
  className={`cursor-pointer transition-all ${
    eForm.selectedItems.includes(item)
      ? 'bg-primary text-primary-foreground'
      : 'bg-muted'
  }`}
>
            {item}
          </Badge>
        ))}
      </div>

      {/* CUSTOM */}
      <Input
        placeholder="Any other requirement..."
        value={eForm.customItem}
        onChange={(e) => setEForm({ ...eForm, customItem: e.target.value })}
      />

      {/* SUBMIT */}
      <Button
        className="w-full gradient-primary text-primary-foreground"
        onClick={handleSendEquipment}
      >
        <SendHorizontal className="mr-2 h-4 w-4" />
        Send Equipment Request
      </Button>

    </CardContent>
  </Card>
)}
     
    </div>
  );
}